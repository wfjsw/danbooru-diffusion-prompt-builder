# ******************************************************************************
#  Danbooru Diffusion Prompt Builder
#  Copyright (C) 2022  Jabasukuriputo Wang
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
# *****************************************************************************/

@preprocessor typescript

Prompt -> (SinglePrompt [,，]):* SinglePrompt {% ([c,t]) => [...c.map((n: any[]) => n[0]),t] %}
SinglePrompt -> Plain {% id %} | WhitespaceWrapped {% id %} | _ {% () => null %}
WhitespaceWrapped -> _ ( Emphasized {% id %} ) _ {% ([,d]) => d %}
Emphasized ->
	"{" Prompt "}" {% ([,c]) => ({type: 'weight_add', content: c}) %} |
	"[" Prompt "]" {% ([,c]) => ({type: 'weight_sub', content: c}) %}

Plain -> Char:+ {% ([c], l, r) => c.join('').trim() === '' ? r :({type: 'tag', name: c.join('').replace(/[  \t\n\v\f]/g, ' ').trim()}) %}
Char -> [^\\\[\]{}:|,，] {% id %} | "\\{" {% () => '{' %} | "\\}" {% () => '}' %} | "\\[" {% () => '[' %} | "\\]" {% () => ']' %}


Number -> _ unsigned_decimal _ {% ([,d]) => d %}

_  -> wschar:* {% function(d) {return null;} %}
wschar -> [  \t\n\v\f] {% id %}

unsigned_decimal -> [0-9]:+ ("." [0-9]:+):? {%
    function(d) {
        return parseFloat(
            d[0].join("") +
            (d[1] ? "."+d[1][1].join("") : "")
        );
    }
%}
