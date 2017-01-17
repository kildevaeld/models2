package models

import (
  "time"
)

// This is the address
type Address struct {
  // This should stil be here
  Street string 
  City string 
  IsoCode string 
  CreatedAt time.Time 
}