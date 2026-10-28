module.exports = {
    name: 'api',
    aliases: ["apis","cmd_api","alt_api","atalho_api","abrev_api","call_api","func_api"],
    category: 'dev',
    description: 'Lista de APIs públicas e gratuitas para desenvolvedores',
    execute: async ({ reply }) => {
        const apiList = `🌐 *APIs PÚBLICAS E GRATUITAS PARA PROJETOS:*

• *PokeAPI:* https://pokeapi.co/
• *JSONPlaceholder:* https://jsonplaceholder.typicode.com/
• *Rick and Morty:* https://rickandmortyapi.com/
• *OpenWeather:* https://openweathermap.org/api
• *GitHub API:* https://docs.github.com/rest`
        await reply(apiList)
    }
}