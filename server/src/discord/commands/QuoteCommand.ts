import { CacheType, CommandInteraction, EmbedBuilder } from 'discord.js'
import { ICommand } from './ICommand'
import { Quote } from '../../common/Quote'
import { Database } from '../../common/Database'

export default class QuoteCommand implements ICommand {
    async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
        let quote = interaction.options.get('quote')
        if (!quote) {
            await interaction.reply({ content: 'You need to provide a quote!', ephemeral: true })
            return
        }
        let stringQuote = (quote.value as string).replaceAll('\\n', '\n')
        const quoteObject = new Quote(null, stringQuote, interaction.user.id, Date.now(), [], 0)
        const quoteCreator = interaction.guild?.members.cache.find((member) => member.id === interaction.user.id)
        await Database.getInstance().insert<Quote>('quote', quoteObject) // this usually never takes more than 3 seconds, so we don't need to defer
        const quoteEmbed = new EmbedBuilder()
            .setColor('Random')
            .setDescription(quoteObject.content)
            .setFooter({
                text: quoteCreator?.nickname ?? 'Unknown author',
                iconURL: quoteCreator?.displayAvatarURL() ?? undefined,
            })
            .setTimestamp(quoteObject.timestamp)

        await interaction.reply({ embeds: [quoteEmbed] })
    }
}
