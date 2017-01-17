{
	const tokens = require('./tokens');
	const Token = tokens.Token;
	const Modifier = tokens.Modifier;
	const Type = tokens.Type;
	const lodash = require('lodash');
}


Expression
  = __ p:Package __ i:(__ i:Import __ { return i;})* __  b:Body? {
		return p.concat([i.concat(b)]);
  }



Package
	=  __ "package" _+ p:alpha+ __ semi __   { return [Token.Package, p.join('')]; }

Import
	=  __ "import" _+ quote n:import_statement* quote __  semi __ {
		return [Token.Import, n.join('')];
	}

    
Body 
	= __ r:Records __ { return r }

Records 
	= __ recs:(  __ r:Record __ { return r; })+ { return recs; } 

Record
	= a:(aa:Annotation __ { return aa;})* "record" _+ name:[a-zA-Z0-9]+ __ "{" __ body:RecordBody* __ "}" {
		return [Token.Record, name.join(''), a.concat(body)];
    }
    
RecordBody
	= props:(__ p:Property __ { return p; }) {
    	return props
    }

/*Property
	= a:Annotation _m p:Property { return a.concat([p]) }
    / name:alpha+ o:'?'? _m ":" _m  type:PropertyType _m semi {
    	return [Token.Property, name.join(''), type]
    }
*/

Property
	= a:(aa:Annotation __ { return aa;})* __ name:alpha+ o:'?'? __ ":" __  type:PropertyType _m semi {
		type[2].push(...a)
		return [Token.Property, name.join(''), type]
    }

PropertyType
	= "[" __ t:Type __ "]" mod:Modifier? { 
			t.push([[Token.Modifier, Modifier.Repeated]])
			if (mod) t[2].push(mod)	
			return t; 
		}
	/ t:Type mod:Modifier? {
		t.push([])
		if (mod) t[2].push(mod);
		return t
	 }

Type 
	= t:ImportType
	/ t:BuildInType { return [Token.BuildinType, t]}


BuildInType
	= "string" { return Type.String; }
	/ "date" { return Type.Date; }
	/ "bool" { return Type.Boolean; }
	/ "int" { return Type.Int; }
	/ "uint" { return Type.Uint; }
	/ "int8" { return Type.Int8; }
	/ "int16" { return Type.Int16; }
	/ "int32" { return Type.Int32; }
	/ "int64" { return Type.Int64; }
	/ "uint8" { return Type.Int8; }
	/ "uint16" { return Type.Uint16; }
	/ "uint32" { return Type.Uint32; }
	/ "uint64" { return Type.Uint64; }
	/ "double" { return Type.Double; }
	/ "float" { return Type.Float; }
  / "bytes" { return Type.Bytes; }

ImportType
	= p:([a-zA-Z][a-zA-Z0-9]+) "." t:([a-zA-Z][a-zA-Z0-9]+) {
		return [Token.ImportType, [lodash.flatten(p).join(''),lodash.flatten(t).join('')]];
	}

Modifier
	= "?" { return [Token.Modifier, Modifier.Optional]}

Annotation
	= "@" a:alpha+ "(" o:JSON_text ")" {
		return [Token.Modifier, Modifier.Annotation, a.join('')]
	}
	/ "@" a:alpha+ { return [Token.Modifier, Modifier.Annotation, a.join('')];}




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