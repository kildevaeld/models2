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

start
  = program:Program { return program; }


Program
  = __ p:Package __ body:Elements? __ {
    return expression(Token.Package, p, body)
  }

/*Elements
  = head:(__ Import)? __ tail:Body? __ {

    return (head||[null]).slice(1).concat(tail)
  }*/
Elements
  = head:Element rest:(ws e:Element { return e; })* {
    return [head].concat(rest);
  }

Element
  = r:Record { return r; }
  / e:EnumType { return e; }
  / i:Import { return i; }
  / s:Service { return s; }

Package
  =  __ "package" _+ p:alpha+ __ semi __   { return p.join(''); }

Import
	=  __ "import" _+ quote n:import_statement+ quote __  semi __ {
		return expression(Token.Import, n.join(''))
	}


Body
	= r:Records { return r }

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
	= a:(aa:Annotation __ { return aa;})* __ name:Identifier __ ":" __  type:PropertyType __ semi {
    return expression(Token.Property, name, a, type)
  }


PropertyType
  = t:Type "?" { return expression(Token.OptionalType, t); }
  / t:Type { return t; }


Type
	= CompositeType
  / t:ImportType { return t; }
	/ t:PrimitiveType { return expression(Token.PrimitiveType, t) }
  / t:Identifier { return expression(Token.RecordType, t) }

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
  = "[" ws t:Type ws "]" { return expression(Token.RepeatedType, t)}

MapType
  = "map<" __ k:Type __ "," __ v:Type __ ">" {
    return expression(Token.MapType, k, v);
  }

ImportType
	= p:Identifier "." t:Identifier {
    return expression(Token.ImportType, p, t);
	}

EnumType 
  = "enum" __  i:Identifier __ "{" __ e:enum_members __  "}" {
    return expression(Token.EnumType, i, e);
  }

enum_members
  = e:enum_member __ rest:(__ ";" __ e:enum_member { return e} )* {
    return [e].concat(rest)
  }

enum_member
  = i:Identifier __ "=" __ d:DIGIT+ { return expression(Token.EnumMember, i, parseInt(d.join('')))  }
  / i:Identifier { return expression(Token.EnumMember, i, null) }

Annotation
	= "@" a:Identifier "(" o:Argument ")" {
    return expression(Token.Annotation, a, o);
  }
	/ "@" a:Identifier { return expression(Token.Annotation, a, true); }

// Services

Service
    =  a:(aa:Annotation __ { return aa;})* "service" ws name:Identifier ws "{" ws m:methods* ws "}"  {
        return expression(Token.Service, name, a, m);
    }

methods
    = methods:(__ p:method __ { return p; }) {
    	return methods
    }


method
    =  a:(aa:Annotation __ { return aa;})* name:Identifier ws "(" ws m:method_parameter ws ")" ws r:(":" ws r:return_arguments { return r; })? ws   {
        //return {name:name, args:m, returns: r, annotations: a};
        return expression(Token.Method, name, a, m, r);
    }

method_parameter
    = i:Type (!":") { return i; }
    / method_arguments


method_arguments
    = members:(
        head:method_argument
        tail:("," ws m:method_argument { return m; })*
        {
          return expression(Token.AnonymousRecord, [head].concat(tail));
        }
      )? { return members}

method_argument
    = name:Identifier ws ":" ws value:PropertyType ws {
        return expression(Token.Property, name, [], value) //{name:name, value:value};
    }

return_arguments
    =  i:Type { return i }
    / "(" ws m:method_parameter ws ")" {
        return m;
    }

// Service end


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

ws "whitespace" = [ \t\n\r]*

_
	= [ \t\n\r]

__
  = (WhiteSpace / LineTerminatorSequence / Comment)*

// Comments

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

// Annotation Arguments

Argument
  = value:value { return value; }

begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator
  = ws "," ws

values
  = a:value ws rest:(ws value_separator ws value:value ws{ return value;})* { return [a].concat(rest); }

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
  = name:member_key name_separator value:value {
      return { name: name, value: value };
    }

member_key
    = string
    / Identifier

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

// Numbers
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
