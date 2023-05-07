# Pscodium Bot

## Dependencies
- Typescript
- Discords.js
- NodeJS
- Docker
- Npm
- Nvm
- Docker-compose
- MySQL
- Sequelize

## Environment Variables

```

BOT_TOKEN="Your-Token"

DB_HOST=db
DB_USER=user
DB_PASSWORD=password
DB_PORT=port(3306 default)
DB_NAME=database

```

## Start


1. `nvm use`

2. `npm install`

3. `make up && make logs` (to view logs)



## Versions

- v0.15 - Added `/blackjack` and `/emoji` command tests.

- v0.14 - Command `/give-money` now it has a boolean field to change a reply message visibility.

- v0.13 - Added the `/profile` command.

- v0.12 - Added the `/ranks` command to list the top 10 users with the highest total balance and for admin users added `/alert` command to send a messa in DM of the mentioned user. 

- v0.11 - Added the `/avatar` command to get user picture and reply in the chat with this image.

- v0.10 - Added the `/give-money` command to give money from mentioned user. (only for this bot contributors).

- v0.09 - Added 4 new commands `/balance`, `/bank <subcommand>`, `/crash` and `/announcement` in this bot.
  - Balance - Get user bank information or mentioned user.
  - Bank - Withdraw or deposit transactions to money interaction.
  - Crash - Lucky game added.
  - Announcement - Command to admin users to do some announcement in the channel interaction.

- v0.08 - Added mysql database connection with sequelize ORM.

- v0.07 - Added 3 new commands `/count`, `/manage <subcommand>` and `/embed`.
  - Count - Get some server numbers information.
  - Manage - Kick, Punish or Ban users from guild.
  - Embed - Create a test embed only for developers.

- v0.06 - Added 2 new commands `/server <subcommand>` and `/clear`.
  - Server - Added `<icon>` subcommand to change the server icon.
  - Clear - Clear chat messages.

- v0.05 - Added docker-compose to store bot and database in a container and upload it to a server.

- v0.04 - Added mention command in right click in the another user.

- v0.03 - Added logs events and ready message.

- v0.02 - Created Design Pattern from this project.

- v0.01 - Project creation.

## Possible Features
- Leveling system for the users rewards.
- Daily Rewards.
- Commands cooldown.
- Inventory system maybe for the another future games.
- Remove Admin commands or improve commands for real uses.
- Create welcome and leave messages.
- Store in user database the users games information (wins, loses, ratio etc)

## Commands Version
- Blackjack v1 - Command under creation and will need trial versions.
  - Create a tie between dealer and user.
  - Create more moves and store all the possibilities.
  - If user writes command but doesn't play, store current move in database to avoid players cheating games.
  - Create the double down button interaction.

- Crash v1 - Command created and working.
  - Create animations for the command to make it interactive (Possible spike).
  - Create an award system for consecutive victories.

- Dice v1 - Command under creation and will need trial versions.
  - Create an award system for consecutive victories.

## Hotfixes

