export function getDynamicTitle(contentId: string) {

    if (contentId.split('/').length > 1) {
        const splitContentId = contentId.split('/')
        return splitContentId[splitContentId.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    } else {
        return contentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
}