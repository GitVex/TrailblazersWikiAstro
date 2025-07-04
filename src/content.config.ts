import {defineCollection, z} from 'astro:content'
import {glob} from 'astro/loaders'

const content = defineCollection({
    loader: glob({pattern: '**/*.{md,mdx}', base: './src/content/'}),
    schema: z.object({
        title: z.optional(z.string()),
        allowedUsers: z.optional(z.string()),
        parentArticle: z.optional(z.string()),
    }),
})

export const collections = {
    content
}