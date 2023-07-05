
class TextManipulator {
    async capitalizedCase(text: string | undefined | null) {
        if (!text) return;
        if (typeof text == 'string') {
            text = String(text);
        }
        const words = text.toLowerCase().split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(' ');
    }
}
export const textManipulator = new TextManipulator();
