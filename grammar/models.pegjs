{
	var tokens = require('./tokens');
	var Token = tokens.Token;
	var Modifier = tokens.Modifier;
	var Type = tokens.Type;
	var lodash = require('lodash');
  var createExpression = require('./expressions').createExpression;

  function extractList(list, index) {
    return list.map(function(element) { return element[index]; });
  }

  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
  }

  var slice = Array.prototype.slice;
  function expression() {
    var args = slice.call(arguments);
    var type = args.shift();
    return createExpression.apply(null, [type, location()].concat(args));
  }

}


/*Expression
  = __ p:Package __ i:(__ i:Import __ { return i;})* __  b:Body? {
		return p.concat([i.concat(b)]);
  }*/

start
  = program:Program { return program; }


Program
  = __ p:Package __ body:Elements? {
    return expression(Token.Package, p, body)
  }

Elements
  = head:(__ Import)? __ tail:Body? __ {

    return (head||[null]).slice(1).concat(tail)
  }

Package
  =  __ "package" _+ p:alpha+ __ semi __   { return p.join(''); }

Import
	=  __ "import" _+ quote n:import_statement+ quote __  semi __ {
		return expression(Token.Import, n.join(''))
	}


Body
	= __ r:Records __ { return r }

Records
	= __ recs:(  __ r:Record __ { return r; })+ { return recs; }

Record
	= a:(aa:Annotation __ { return aa;})* "record" _+ name:Identifier __ "{" __ body:RecordBody* __ "}" {
		//return [Token.Record, name, a.concat(body)];
    return expression(Token.Record, name, a, body)
  }

RecordBody
	= props:(__ p:Property __ { return p; }) {
    	return props
    }


Property
	= a:(aa:Annotation __ { return aa;})* __ name:alpha+ __ ":" __  type:PropertyType __ semi {
    return expression(Token.Property, name.join(''), a, type)
  }


PropertyType
  = t:Type "?" { return expression(Token.OptionalType, t); }
  / t:Type { return t; }


Type
	= CompositeType
  / t:ImportType { return t; }
	/ t:PrimitiveType { return expression(Token.BuildinType, t)}

CompositeType
  = ArrayType
  / MapType

PrimitiveType
	= "string" { return Type.String; }
	/ "date" { return Type.Date; }
	/ "bool" { return Type.Boolean; }
	/ "int" { return Type.Int; }
	/ "uint" { return Type.Uint; }
	/ "int8" { return Type.Int8; }
	/ "int16" { return Type.Int16; }
	/ "int32" { return Type.Int32; }
	/ "int64" { return Type.Int64; }
	/ "uint8" { return Type.Uint8; }
	/ "uint16" { return Type.Uint16; }
	/ "uint32" { return Type.Uint32; }
	/ "uint64" { return Type.Uint64; }
	/ "double" { return Type.Double; }
	/ "float" { return Type.Float; }
  / "bytes" { return Type.Bytes; }

ArrayType
  = begin_array t:Type end_array { return expression(Token.RepeatedType, t)}

MapType
  = "map<" __ k:Type __ "," __ v:Type __ ">" {
    return expression(Token.MapType, k, v);
  }

ImportType
	= p:Identifier "." t:Identifier {
    return expression(Token.ImportType, p, t);
	}


Annotation
	= "@" a:Identifier "(" o:JSON_text ")" {
    return expression(Token.Annotation, a, o);
  }
	/ "@" a:Identifier { return expression(Token.Annotation, a, null); }



Identifier
  = a:([a-zA-Z][a-zA-Z0-9_]+) { return lodash.flatten(a).join(''); }

import_statement
	= [a-zA-Z0-9_./]

quote
	= single_quote
	/ double_quote

single_quote
	= "'"

double_quote
	= "\""
semi
	= ";";

alpha
	= [a-zA-Z]

num
	= [0-9]

alphanum
	= [a-zA-Z0-9_]

_
	= [ \t\n\r]

_m "whitespace"
  = [ \t\n\r]*




JSON_text
  = ws value:value ws { return value; }

begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws "," ws

ws "whitespace" = [ \t\n\r]*

// ----- 3. Values -----

value
  = false
  / null
  / true
  / object
  / array
  / number
  / string

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

// ----- 4. Objects -----

object
  = begin_object
    members:(
      head:member
      tail:(value_separator m:member { return m; })*
      {
        var result = {};

        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });

        return result;
      }
    )?
    end_object
    { return members !== null ? members: {}; }

member
  = name:string name_separator value:value {
      return { name: name, value: value };
    }

// ----- 5. Arrays -----

array
  = begin_array
    values:(
      head:value
      tail:(value_separator v:value { return v; })*
      { return [head].concat(tail); }
    )?
    end_array
    { return values !== null ? values : []; }

// ----- 6. Numbers -----

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point
  = "."

digit1_9
  = [1-9]

e
  = [eE]

exp
  = e (minus / plus)? DIGIT+

frac
  = decimal_point DIGIT+

int
  = zero / (digit1_9 DIGIT*)

minus
  = "-"

plus
  = "+"

zero
  = "0"

// ----- 7. Strings -----

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

quotation_mark
  = '"'

unescaped
  = [^\0-\x1F\x22\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i

__
  = (WhiteSpace / LineTerminatorSequence / Comment)*

SourceCharacter
  = .

Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]


WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" (!("*/" / LineTerminator) SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*
