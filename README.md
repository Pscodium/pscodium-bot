# Pscodium Bot v1.1.8

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

## Initialization

#### After start this project do you need to set somethings.

- After turn on bot you need to populate some database tables.
  - Achievements
  - Badges
  - Cards
- To populate this tables you need to type this command `/populate`.
- If you have some changes in any of these tables and you want to save this changes, you need to make this locally, using the `/json-saver` on development environment.
- Json files will fill your database when you need to populate tables that need commands for creating items.

## Versions

- v1.1.8 - Ticket System, Autorole and Verify System. 

- v1.1.7 - New Achievements for rewards players when they reached account bank balance.

- v1.1.6 - Added Achievements system to rewards players.

- v1.1.5 - Added `/blackjack` and `/emoji` command tests.

- v1.1.4 - Command `/give-money` now it has a boolean field to change a reply message visibility.

- v1.1.3 - Added the `/profile` command.

- v1.1.2 - Added the `/ranks` command to list the top 10 users with the highest total balance and for admin users added `/alert` command to send a messa in DM of the mentioned user. 

- v1.1.1 - Added the `/avatar` command to get user picture and reply in the chat with this image.

- v1.1.0 - Added the `/give-money` command to give money from mentioned user. (only for this bot contributors).

- v1.0.9 - Added 4 new commands `/balance`, `/bank <subcommand>`, `/crash` and `/announcement` in this bot.
  - Balance - Get user bank information or mentioned user.
  - Bank - Withdraw or deposit transactions to money interaction.
  - Crash - Lucky game added.
  - Announcement - Command to admin users to do some announcement in the channel interaction.

- v1.0.8 - Added mysql database connection with sequelize ORM.

- v1.0.7 - Added 3 new commands `/count`, `/manage <subcommand>` and `/embed`.
  - Count - Get some server numbers information.
  - Manage - Kick, Punish or Ban users from guild.
  - Embed - Create a test embed only for developers.

- v1.0.6 - Added 2 new commands `/server <subcommand>` and `/clear`.
  - Server - Added `<icon>` subcommand to change the server icon.
  - Clear - Clear chat messages.

- v1.0.5 - Added docker-compose to store bot and database in a container and upload it to a server.

- v1.0.4 - Added mention command in right click in the another user.

- v1.0.3 - Added logs events and ready message.

- v1.0.2 - Created Design Pattern from this project.

- v1.0.1 - Project creation.

## Possible Features

- Leveling system for the users rewards.
- Daily Rewards.
- Commands cooldown.
- Inventory system maybe for the another future games.
- Remove Admin commands or improve commands for real uses.
- Create welcome and leave messages.
- Store in user database the users games information (wins, loses, ratio etc)

## Commands Version

- Blackjack v1 - Command under tests.
  - Create more moves and store all the possibilities.
  - If user writes command but doesn't play, store current move in database to avoid players cheating games.
  - Create the double down button interaction.
- Blackjack v1.0.1 - Command under tests.
  - Create a tie between dealer and user.
  - Change max cards to five.
  - Fix dealer moves because it broke the system when clicking "stand" and because it didn't have some game logic.

- Blackjack v1.0.2 - Command under tests.

  - Create blackjack database to store user plays.
  - Create Emoji database to store all emojis list.

  - If user writes command but doesn't play, store current move in database to avoid players cheating games.

- Crash v1 - Command created and working.
  - Create animations for the command to make it interactive (Possible spike).
  - Create an award system for consecutive victories.

- Dice v1 - Command under creation and will need trial versions.
  - Create an award system for consecutive victories.

## Plans

Think about new plans for this discord bot.

### Future plans

- [ ] Command to add verified emblem to user profile.

- [ ] Create more database information to users.
- [ ] Role change logs.
- [ ] Autorole.
- [x] Addition of Blackjack command
  - [x] Create a database to store users plays
  - [x] Create advanced plays to game
  - [x] Create an embed to display
  - [x] Create emojis for blackjack cards
  - [x] Create new colors script
  - [x] Create system to reward player for wins
  - [ ] Create leveling system

- [x] Database for games scoreboard.
  - [x] This database will need columns for describe how many games users plays, wins and losses.
  - [ ] This database will be used for leveling based on players wins.

- [ ] Maybe consider to make more lucky games
  - [ ] Dice
  - [ ] Rock Papel Scissors
  - [ ] Loterry

- [ ] Games to think about
  - [ ] RPG Game
    - [ ] Balance
    - [ ] Profile
    - [ ] Rank
    - [ ] Inventory
    - [ ] Bank
    - [ ] Adventure
    - [ ] Hunt
    - [ ] Chopper
    - [ ] Fishing
    - [ ] Case opening
    - [ ] Duel
    - [ ] Dungeon
    - [ ] Enchanting
    - [ ] Forge 
  - [ ] Logic game
    - [ ] Questions
    - [ ] Maths

### Database plans

- [ ] Create more associations for the user table.
- [ ] Scoreboard games table.
- [x] Games table.
- [ ] Command cooldown based on timestamp column from database game table.
- [x] Table Achievements.
  - [x] Win games.
  - [x] Reach money on bank account.
  - [ ] Level reached.
  - [ ] 
- [ ] Table game need more columns to complement
  - [ ] Level
  - [ ] Experience
  - [ ] Life
  - [ ] Defense
  - [ ] Attack Power

### Database security

**Avoid deleting columns of these tables**

- Achievements
- Cards
- Badges

**Tables that can have columns deleted**

- Users
- Games
- Banks
- Blackjacks
- User
