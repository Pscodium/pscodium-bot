import WebSocket from 'ws';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { ExtendedClient } from '../structs/ExtendedClient';
import guildsService from './guilds.service';
import { appConfig } from '../config/app.config';

interface GlobalEventNotification {
    v: 1;
    type: 'global-event-lifecycle';
    at: number;
    instanceId: string;
    templateId: string;
    templateName: string;
    eventType: 'WEATHER' | 'GLOBAL' | 'RARE' | 'SEASONAL' | 'CURSE';
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
    startAt: string;
    endAt: string;
    triggeredBy: string | null;
}

const PUBLISHED_STATUSES: ReadonlySet<string> = new Set(['ACTIVE', 'ENDED']);

const STATUS_COLOR: Record<string, number> = {
    ACTIVE: 0x2ecc71,
    ENDED: 0xe67e22,
    CANCELLED: 0xe74c3c,
    PENDING: 0x3498db,
};

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Ativo',
    ENDED: 'Encerrado',
    CANCELLED: 'Cancelado',
    PENDING: 'Agendado',
};

const EVENT_TYPE_EMOJI: Record<string, string> = {
    WEATHER: '🌦️',
    GLOBAL: '🌍',
    RARE: '💎',
    SEASONAL: '🍂',
    CURSE: '💀',
};

export class GlobalEventWsService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private consecutiveWs401 = 0;
    private readonly seenEvents = new Set<string>();
    private readonly client: ExtendedClient;
    private destroyed = false;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    async start(): Promise<void> {
        const { wsBase, apiKey } = appConfig.ocsGame;

        if (!wsBase) {
            console.warn('[ocs-events] OCS_API_WS_BASE não configurado — integração de eventos globais desativada.');
            return;
        }

        if (!apiKey) {
            console.warn('[ocs-events] OCS_API_KEY não configurado — integração de eventos globais desativada.');
            return;
        }

        console.log('[ocs-events] API key carregada para autenticação de eventos globais.');
        this.connect();
    }

    private connect(): void {
        const { wsBase, apiKey } = appConfig.ocsGame;
        if (this.destroyed || !apiKey) return;

        const wsBaseUrl = wsBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
        const encodedApiKey = encodeURIComponent(apiKey);
        const url = `${wsBaseUrl}/ws/events/global?api_key=${encodedApiKey}&apikey=${encodedApiKey}&key=${encodedApiKey}`;

        this.ws = new WebSocket(url, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'x-api-key': apiKey,
                'api-key': apiKey,
            },
        });

        this.ws.on('open', () => {
            this.reconnectAttempts = 0;
            this.consecutiveWs401 = 0;
            console.log('[ocs-events] ✅ Conectado ao stream de eventos globais.');
        });

        this.ws.on('message', (raw) => {
            this.handleMessage(raw.toString()).catch((err) => {
                console.error('[ocs-events] Erro ao processar mensagem de evento:', err);
            });
        });

        this.ws.on('close', (code) => {
            console.warn(`[ocs-events] Conexão encerrada (código ${code}). Reconectando...`);
            this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
            console.error('[ocs-events] Erro no WebSocket:', err);
            if ((err as Error)?.message?.includes('401')) {
                this.consecutiveWs401 += 1;

                if (this.consecutiveWs401 === 1) {
                    console.warn('[ocs-events] 401 no handshake WS. Verifique: (1) OCS_API_WS_BASE aponta para a API OCS correta, (2) conta técnica possui save ativo (activePlayerId), (3) token contém escopo/claims aceitos pelo requireAuth da rota de eventos.');
                }

                if (this.consecutiveWs401 >= 5) {
                    console.warn('[ocs-events] Muitas respostas 401 consecutivas. Entrando em modo de espera de 60s para evitar flood de reconexão.');
                }
            }
            this.scheduleReconnect();
            this.ws?.close();
        });
    }

    private scheduleReconnect(): void {
        if (this.destroyed) return;

        if (this.reconnectTimer) return;

        this.reconnectAttempts += 1;
        const baseDelay = Math.min(15_000, 1_000 * 2 ** Math.min(this.reconnectAttempts, 6));
        const delay = this.consecutiveWs401 >= 5 ? 60_000 : baseDelay;

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    private async handleMessage(raw: string): Promise<void> {
        let event: unknown;
        try {
            event = JSON.parse(raw);
        } catch {
            return;
        }

        const notification = event as GlobalEventNotification;

        if (notification?.type !== 'global-event-lifecycle') return;
        if (!PUBLISHED_STATUSES.has(notification.status)) return;

        const dedupKey = `${notification.instanceId}:${notification.status}`;
        if (this.seenEvents.has(dedupKey)) return;
        this.seenEvents.add(dedupKey);
        setTimeout(() => this.seenEvents.delete(dedupKey), 60 * 60 * 1_000);

        const channelIds = await this.getChannelIds();
        if (channelIds.length === 0) return;

        const embed = this.buildEmbed(notification);

        console.log(`[ocs-events] 📢 Evento "${notification.templateName}" (${notification.status}) → ${channelIds.length} canal(is)`);

        await Promise.allSettled(
            channelIds.map(async (channelId) => {
                try {
                    const channel = await this.client.channels.fetch(channelId);
                    if (channel instanceof TextChannel) {
                        await channel.send({ embeds: [embed] });
                    }
                } catch (err) {
                    console.error(`[ocs-events] Erro ao enviar embed para canal ${channelId}:`, err);
                }
            })
        );
    }

    private async getChannelIds(): Promise<string[]> {
        const guildIds = this.client.guilds.cache.map((g) => g.id);
        return guildsService.getGuildGameJobChannelIds(guildIds, 'global_events_channel_id');
    }

    private buildEmbed(event: GlobalEventNotification): EmbedBuilder {
        const emoji = EVENT_TYPE_EMOJI[event.eventType] ?? '📢';
        const statusLabel = STATUS_LABEL[event.status] ?? event.status;
        const color = STATUS_COLOR[event.status] ?? 0x95a5a6;

        const startTs = Math.floor(new Date(event.startAt).getTime() / 1_000);
        const endTs = Math.floor(new Date(event.endAt).getTime() / 1_000);

        return new EmbedBuilder()
            .setTitle(`${emoji} Evento ${statusLabel}: ${event.templateName}`)
            .setColor(color)
            .addFields(
                { name: 'Tipo', value: event.eventType, inline: true },
                { name: 'Início', value: `<t:${startTs}:f>`, inline: true },
                { name: 'Fim', value: `<t:${endTs}:f>`, inline: true },
            )
            .setFooter({ text: `templateId=${event.templateId} | instanceId=${event.instanceId}` })
            .setTimestamp(new Date(event.at));
    }

    destroy(): void {
        this.destroyed = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.ws?.close();
    }
}
