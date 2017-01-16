{
	const tokens = require('./tokens');
	const Token = tokens.Token;
	const Modifier = tokens.Modifier;
	const Type = tokens.Type;
	const lodash = require('lodash');
}
/*
 * Simple Arithmetics Grammar
 * ==========================
 *
 * Accepts expressions like "2 * (3 + 4)" and computes their value.
 */
Expression
  = _m p:Package _m i:(i:Import _m { return i;})* _m  b:Body? {
		return p.concat([i.concat(b)]);
  }


Package
	= "package" _m p:alpha+ _m semi _m { return [Token.Package, p.join('')]; }

Import
	= "import" _m quote n:import_statement* quote _m  semi _m {
		return [Token.Import, n.join('')];
	}

    
Body 
	= _m r:Records _m { return r }

Records 
	= _m recs:( _m r:Record _m { return r; })+ { return recs; } 

Record
	= "record" _+ name:[a-zA-Z0-9]+ _m "{" _m body:RecordBody* _m "}" {
    	return [Token.Record, name.join(''), body];
    }
    
RecordBody
	= props:(_m p:Property _m { return p; }) {
    	return props
    }

Property
	= a:Annotation _m p:Property { return a.concat([p]) }
    / name:alpha+ o:'?'? _m ":" _m  type:PropertyType _m semi {
    	return [Token.Property, name.join(''), type]
    }

PropertyType
	= "[" _m t:Type _m "]" mod:Modifier? { 
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

ImportType
	= p:([a-zA-Z][a-zA-Z0-9]+) "." t:([a-zA-Z][a-zA-Z0-9]+) {
		return [Token.ImportType, [lodash.flatten(p).join(''),lodash.flatten(t).join('')]];
	}

Modifier
	= "?" { return [Token.Modifier, Modifier.Optional]}

Annotation
	= "@" a:alpha+ { return [Token.Annotation, a.join('')];}

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