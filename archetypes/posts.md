---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
hero: images/posts/category-name/hero-image.png
description: "Brief description of what this post covers (appears in search results and social media)"
tags:
  - tag1
  - tag2
categories:
  - category-name
menu:
  sidebar:
    name: "{{ replace .Name "-" " " | title }}"
    identifier: {{ .Name }}
    parent: "CategoryName"
    weight: 10
---

<!-- Brief introduction paragraph explaining what this post is about -->
<!-- Keep paragraphs under 5 lines for better readability -->

## Main Section

<!-- Use ### for subsections -->
### Subsection

<!-- Always specify language for code blocks -->
```yaml
# Always specify language for code blocks
your_code_here
```

```bash
# Example bash command
echo "Hello World"
```

<!-- Use numbered lists for sequential steps -->
1. First step description with clear action
2. Second step description
3. Third step description with details

<!-- Use bullet points for non-ordered items -->
- Important point one
- Important point two
- Important point three

<!-- Add emphasis to key terms -->
Use *emphasis* for key terms and **bold** for important concepts.

<!-- Use blockquotes for quotes or important notes -->
> This is a blockquote for highlighting important information

<!-- Add blank lines between paragraphs for better readability -->

## Additional Section

<!-- Continue with proper heading hierarchy -->
<!-- Use ## for main sections and ### for subsections -->

<!-- Code inline with backticks: `command` -->

### Best Practices

- Keep paragraphs concise (3-5 lines max)
- Use descriptive headings
- Add alt text to images
- Test code snippets before including
- Include error messages and solutions when relevant

## Conclusion

<!-- Brief summary and any next steps or resources -->