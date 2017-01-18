package models

import (
  "time"
)

// This is the address
type Address struct {
  // This should stil be here
  Street string `json:"street,omitempty"`
  City string `json:"city,omitempty"`
  IsoCode string `json:"isocode,omitempty"`
  CreatedAt *time.Time `json:"created_at"`
  Email []string `json:"email,omitempty"`
  Test []string `json:"test,omitempty"`
}