/**
 * Stand-alone function to parse a HXL hashtag and attributes
 *
 * The result will be an object with two properties, "tag" for the
 * hashtag, and "atts" for an array of attributes. For example,
 * #affected+refugees+children+f will parse to
 *
 *     {
 *         tag: "affected",
 *         atts: ["refugees", "children", "f"]
 *     }
 *
 * Note that the parser removes "#" from the hashtag, and "+" from the
 * attribute names. It also normalised all names to lower case.
 *
 * To check for an attribute:
 *
 *     p = hxl_parse_hashtag("#affected +refugees +children +f");
 *     p.atts.includes("refugees"); // true
 *     p.atts.includes("idps"); // false
 *
 * @param s The hashtag and attributes (may contain whitespace)
 * @returns The parsed object, or False if the hashtag spec was
 * unparseable.
 */
function hxl_parse_hashtag (s) {

    var parsed = s.match(/^\s*(#[A-Za-z][A-Za-z0-9_]*)((\s*\+[A-Za-z][A-Za-z0-9_]*)*)?\s*$/);

    if (parsed) {
        var attributes = [];
        if (parsed[2]) {
            attributes = parsed[2].split(/\s*\+/).filter(attribute => attribute.toLowerCase());
        }
        return {
            tag: parsed[1].toLowerCase(),
            atts: attributes
        };

    } else {
        return False;
    }
}
