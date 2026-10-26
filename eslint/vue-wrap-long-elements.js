// eslint-plugin-vue wraps elements by attribute count or unconditionally; this wraps only the ones that run long.

const WHITESPACE_SENSITIVE = new Set(['pre', 'textarea'])

export default {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'Break an element that runs past the maximum line length',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxLength: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      { maxLength: 120 },
    ],
    messages: {
      tooLong: 'This element runs past {{maxLength}} columns; break it across lines.',
    },
  },
  create(context) {
    const [{ maxLength }] = context.options
    const { sourceCode } = context
    const text = node => sourceCode.getText(node)

    return sourceCode.parserServices.defineTemplateBodyVisitor({
      VElement(element) {
        const { startTag, endTag } = element
        const { start, end } = element.loc
        if (startTag.loc.start.line !== startTag.loc.end.line)
          return

        const line = sourceCode.lines[start.line - 1]
        const indent = line.slice(0, start.column)
        if (line.length <= maxLength || indent.trim())
          return

        const breakAttributes = startTag.attributes.length > 1 && indent.length + text(startTag).length > maxLength

        // Wrapping adds a space at each edge of the content. An element sharing its line with text
        // or siblings is usually part of an inline run, where that space would show.
        const content = endTag
          && start.line === end.line
          && !line.slice(end.column).trim()
          && !WHITESPACE_SENSITIVE.has(element.name)
          && !startTag.attributes.some(attribute => attribute.directive && attribute.key.name.name === 'pre')
          ? sourceCode.text.slice(startTag.range[1], endTag.range[0]).trim()
          : ''

        if (!breakAttributes && !content)
          return

        context.report({
          node: startTag,
          messageId: 'tooLong',
          data: { maxLength },
          fix(fixer) {
            const fixes = []
            if (breakAttributes) {
              const attributes = startTag.attributes.map(attribute => `\n${indent}  ${text(attribute)}`).join('')
              const close = `\n${indent}${startTag.selfClosing ? '/>' : '>'}`
              fixes.push(fixer.replaceText(startTag, `<${element.rawName}${attributes}${close}`))
            }
            if (content)
              fixes.push(fixer.replaceTextRange([startTag.range[1], endTag.range[0]], `\n${indent}  ${content}\n${indent}`))
            return fixes
          },
        })
      },
    })
  },
}
