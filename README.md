# Records

Generate models like a **god**, using a very simple DSL. 
Very much in progress!

```
// Comments
package "models";

record Blog {
  title: string;
  body: string;
  published_date: date;
  comments: [Comment];
  author: User;
  @schemaformat("uri") // Tell the JSONSchema generator to add a format uri.
  href: string;
}

/* Annotate records and properties with generator specific options.
 * In this case tell the Golang generator to generate Go tags
@gotags("json") 
record Comment {
  title: string;
  body: string;
  
  author: User;
}

record User {
  first_name: string;
  last_name: string;
  bio: string?; // Optional
}


```

Generate models in the desired language

```sh
$ records gen -t Golang *.records -o models
$ records gen -t Typescript *.records -o models
$ records gen -t JSONSchema *.records -o models

```
