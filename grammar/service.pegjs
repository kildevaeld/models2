{
    //var _ = require('lodash');
}


start
    = Service

Identifier
    = a:([a-zA-Z][a-zA-Z0-9_]+) { return [a[0]].concat(a[1]).join(''); }


ws "whitespace" = [ \t\n\r]*

Service
    = "service" ws name:Identifier ws "{" ws m:methods ws "}"  {
        return {name: name, methods:m}
    }

methods
    = method 


method
    = name:Identifier ws "(" ws m:method_parameter ws ")" ws r:(":" ws r:return_arguments { return r; })? ws  {
        return {name:name, args:m, returns: r};
    }

method_parameter
    = i:Identifier (!":") { return i; }
    / method_arguments


method_arguments
    = members:(
        head:method_argument
        tail:("," ws m:method_argument { return m; })*
        {
          var result = {};

          [head].concat(tail).forEach(function(element) {
            result[element.name] = element.value;
          });

          return result; //expression(NodeType.TypedObjectType, result);
        }
      )? { return members}

method_argument
    = name:Identifier ws ":" ws value:Identifier ws {
        return {name:name, value:value};
    }

return_arguments
    =  i:Identifier { return i }
    / "(" ws m:method_parameter ws ")" {
        return m;
    }