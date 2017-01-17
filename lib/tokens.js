"use strict";
var Token;
(function (Token) {
    Token[Token["Package"] = 0] = "Package";
    Token[Token["Record"] = 1] = "Record";
    Token[Token["Property"] = 2] = "Property";
    Token[Token["Import"] = 3] = "Import";
    Token[Token["ImportType"] = 4] = "ImportType";
    Token[Token["BuildinType"] = 5] = "BuildinType";
    Token[Token["Modifier"] = 6] = "Modifier";
})(Token = exports.Token || (exports.Token = {}));
var Modifier;
(function (Modifier) {
    Modifier[Modifier["Optional"] = 0] = "Optional";
    Modifier[Modifier["Repeated"] = 1] = "Repeated";
    Modifier[Modifier["Annotation"] = 2] = "Annotation";
})(Modifier = exports.Modifier || (exports.Modifier = {}));
var Type;
(function (Type) {
    Type[Type["String"] = 0] = "String";
    Type[Type["Date"] = 1] = "Date";
    Type[Type["Int8"] = 2] = "Int8";
    Type[Type["Int16"] = 3] = "Int16";
    Type[Type["Int32"] = 4] = "Int32";
    Type[Type["Int64"] = 5] = "Int64";
    Type[Type["Double"] = 6] = "Double";
    Type[Type["Float"] = 7] = "Float";
    Type[Type["Uint8"] = 8] = "Uint8";
    Type[Type["Uint16"] = 9] = "Uint16";
    Type[Type["Uint32"] = 10] = "Uint32";
    Type[Type["Uint64"] = 11] = "Uint64";
    Type[Type["Boolean"] = 12] = "Boolean";
    Type[Type["Int"] = 13] = "Int";
    Type[Type["Uint"] = 14] = "Uint";
    Type[Type["Bytes"] = 15] = "Bytes";
})(Type = exports.Type || (exports.Type = {}));
