const AutocompleteComponent = require("../../structure/AutocompleteComponent");

module.exports = new AutocompleteComponent({
    commandName: 'classe',
    run: async (client, interaction) => {
        const classeFull = [
            "INF1-A1", "INF1-A2", "INF1-B1", 
            "INF1-B2", "INF1-C1", "INF1-C2", 
            "INF2-FA", "INF2-FI-A", "INF2-FI-B",

            "MMI1-A1", "MMI1-A2", "MMI1-B1", 
            "MMI1-B2", "MMI2-A1", "MMI2-A2", 
            "MMI2-B1", "MMI2-B2",

            "RT1-FA", "RT1-FI-A1", "RT1-FI-A2", 
            "RT1-FI-B1", "RT1-FI-B2",

            "GEII1-TDA1", "GEII1-TDA2", "GEII1-TDB1"
        ];

        const currentInput = interaction.options.getFocused();
        const filteredClasse = classeFull.filter(classe => 
            classe.toLowerCase().startsWith(currentInput.toLowerCase())
        );

        await interaction.respond(filteredClasse.map(classe => ({ 
            name: classe, 
            value: classe 
        })));
    }
}).toJSON();