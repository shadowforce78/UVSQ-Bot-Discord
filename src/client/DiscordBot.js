const { Client, Collection, Partials } = require("discord.js");
const CommandsHandler = require("./handler/CommandsHandler");
const { warn, error, info, success } = require("../utils/Console");
const config = require("../config");
const CommandsListener = require("./handler/CommandsListener");
const ComponentsHandler = require("./handler/ComponentsHandler");
const ComponentsListener = require("./handler/ComponentsListener");
const EventsHandler = require("./handler/EventsHandler");
const { QuickYAML } = require('quick-yaml.db');

class DiscordBot extends Client {
    collection = {
        application_commands: new Collection(),
        message_commands: new Collection(),
        message_commands_aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection()
        }
    }
    rest_application_commands_array = [];
    login_attempts = 0;
    login_timestamp = 0;
    statusMessages = [
        /*
        0	Playing	Playing {name}	"Playing Rocket League"
        1	Streaming	Streaming {details}	"Streaming Rocket League"
        2	Listening	Listening to {name}	"Listening to Spotify"
        3	Watching	Watching {name}	"Watching YouTube Together"
        4	Custom	{emoji} {state}	":smiley: I am cool"
        5	Competing     Competing in {name}	"Competing in Arena World Championship"
         */
        { name: 'UVSQ', type: 3 },
        { name: '/classe', type: 3 },
        { name: '/edt', type: 3 },
        { name: '/help', type: 3 },
        { name: '/support', type: 3 }
    ];

    commands_handler = new CommandsHandler(this);
    components_handler = new ComponentsHandler(this);
    events_handler = new EventsHandler(this);
    database = new QuickYAML(config.database.path);

    constructor() {
        super({
            intents: 3276799,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],
            presence: {
                activities: [{
                    name: 'UVSQ',
                    type: 4,
                    state: 'UVSQ'
                }]
            }
        });

        new CommandsListener(this);
        new ComponentsListener(this);
    }

    startStatusRotation = () => {
        let index = 0;
        setInterval(() => {
            this.user.setPresence({ activities: [this.statusMessages[index]] });
            index = (index + 1) % this.statusMessages.length;
        }, 4000);
    }

    connect = async () => {
        warn(`Attempting to connect to the Discord bot... (${this.login_attempts + 1})`);

        this.login_timestamp = Date.now();

        try {
            await this.login(process.env.CLIENT_TOKEN);
            this.commands_handler.load();
            this.components_handler.load();
            this.events_handler.load();
            this.startStatusRotation();

            warn('Attempting to register application commands... (this might take a while!)');
            await this.commands_handler.registerApplicationCommands(config.development);
            success('Successfully registered application commands. For specific guild? ' + (config.development.enabled ? 'Yes' : 'No'));
        } catch (err) {
            error('Failed to connect to the Discord bot, retrying...');
            error(err);
            this.login_attempts++;
            setTimeout(this.connect, 5000);
        }
    }
}

module.exports = DiscordBot;
