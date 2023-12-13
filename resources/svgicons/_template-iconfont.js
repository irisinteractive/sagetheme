'use strict';


const CUSTOMER_TEMPLATE = `
// Fonts file
@font-face {
    font-family: '__CUSTOMER_FAMILY__';
    font-weight: normal;
    font-style: normal;
    src: url("__CUSTOMER_RELATIVE_FONT_PATH__/__CUSTOMER_FAMILY__.eot"),
    url("__CUSTOMER_RELATIVE_FONT_PATH__/__CUSTOMER_FAMILY__.woff") format('woff'),
    url("__CUSTOMER_RELATIVE_FONT_PATH__/__CUSTOMER_FAMILY__.ttf") format('truetype'),
    url("__CUSTOMER_RELATIVE_FONT_PATH__/__CUSTOMER_FAMILY__.eot?#iefix") format('embedded-opentype'),
    url("__CUSTOMER_RELATIVE_FONT_PATH__/__CUSTOMER_FAMILY__.svg#__CUSTOMER_FAMILY__") format('svg');
    font-display: swap;
}

// Array fonts to mixin
$customer-icons: (
    __CUSTOMER_ICONS__
);

.ci:before,
.ci:after {
    color: $icon-color;
    display: inline-block;
    vertical-align: middle;
    font-family: '__CUSTOMER_FAMILY__', sans-serif;
    font-style: initial;
}

@each $name, $icon in $customer-icons {
        .ci--#{$name}:not(.ci--after):before {
            content: $icon;
        }

        .ci--#{$name}.ci--after:after {
            content: $icon;
        }
    }
`;

function toSCSS(glyphs) {
    return JSON.stringify(glyphs, null, '\t')
        .replace(/\{/g, '(')
        .replace(/\}/g, ')')
        .replace(/\\\\/g, '\\');
}

module.exports = function (args) {
    const family = args.family;
    const pathToFonts = "../fonts/svgfont";
    const glyphs = args.unicodes.reduce(function (glyphs, glyph) {
        glyphs[glyph.name] = '\\' + glyph.unicode.charCodeAt(0).toString(16).toLowerCase();
        return glyphs;
    }, {});
    const data = [];
    let icons_str = '';
    data.push(glyphs);
    icons_str = toSCSS(data).replace(/\[/g, '').replace(/\]/g, '');

    const replacements = {
        __CUSTOMER_FAMILY__: family,
        __CUSTOMER_RELATIVE_FONT_PATH__: pathToFonts,
        __CUSTOMER_ICONS__: icons_str,
    };

    const str = CUSTOMER_TEMPLATE.replace(/__CUSTOMER_FAMILY__|__CUSTOMER_RELATIVE_FONT_PATH__|__CUSTOMER_ICONS__/gi, function (matched) {
        return replacements[matched];
    });

    return [str].join('\n\n');
};
