{
  var lodash = require('lodash');
  var lib = require('./expression')
  var NodeType = lib.NodeType,
    PrimitiveType = lib.PrimitiveType,
    createExpression = lib.createExpression;

    var slice = Array.prototype.slice;
    function expression() {
      var args = slice.call(arguments);
      var type = args.shift();
      return createExpression.apply(null, [type, location()].concat(args));
    }

}

start
  = ws o:options ws {return o}

Identifier
  = a:([a-zA-Z][a-zA-Z0-9_]+) { return lodash.flatten(a).join(''); }

ws "whitespace" = [ \t\n\r]*

options
  = values:(
    head:value
    tail:(value_separator v:value { return v; })*
    { return [head].concat(tail); }
  ) { return expression(NodeType.Argument, values); }

value_separator
  = ws '|' ws

value
  = o:Object { return o; }
  / a:array { return a; }
  / "number" { return expression(NodeType.PrimitiveType, PrimitiveType.Number); }
  / "string" { return expression(NodeType.PrimitiveType, PrimitiveType.String); }
  / "boolean" { return expression(NodeType.PrimitiveType, PrimitiveType.Boolean); }


array
 = "[" ws o:options ws "]" { return expression(NodeType.ArrayType, o); }

Object
  = typed_object
  / object

typed_object
    = "{"
      members:(
        head:member
        tail:(";" m:member { return m; })*
        {
          var result = {};

          [head].concat(tail).forEach(function(element) {
            result[element.name] = element.value;
          });

          return expression(NodeType.TypedObjectType, result);
        }
      )?
      "}"
      { return members !== null ? members: {}; }

member
  = name:Identifier ws ":" ws value:value {
    return { name: name, value: value };
  }

object
  = "{" ws o:options ws "}" { return expression(NodeType.ObjectType, o) }
