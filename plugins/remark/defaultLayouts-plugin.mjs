import path from "path";

const DEFAULT_LAYOUT = path.join(process.cwd(), "src", "layouts", "BaseLayout.astro");

export function setDefaultLayout() {
    return function (_, file) {

        // only add layout if its not an mdx file
        if (file.extname === ".mdx") return;

        const { frontmatter } = file.data.astro;
        if (!frontmatter.layout) frontmatter.layout = DEFAULT_LAYOUT;
    };
}