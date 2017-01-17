package models

// Person is the head of state
type Person struct {
  Id string `json:"id,omitempty" msgpack:"id,omitempty"`
  Name string `json:"name,omitempty" msgpack:"name,omitempty"`
  Description string `json:"description,omitempty" msgpack:"description,omitempty"`
  Address Address `json:"ADRRESS"`
}

type Lars struct {
  Id string 
  Name string 
  Description string 
  Address *Address 
}