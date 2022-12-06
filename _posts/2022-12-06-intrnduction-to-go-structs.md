---
layout: post
section-type: post
title: Introduction to GoLang Structs
category: go
tags: [ 'devops' ]
---

# Introduction to Golang Structs

Golang structs are a powerful tool for organizing data in Go. They allow you to create custom data types that can be used to store and manipulate data in an efficient and organized way. In this blog post, we'll take a look at the basics of Golang structs and how they can be used to make your code more efficient and organized. 

## What is a Struct? 

A struct is a user-defined type that contains a collection of named fields or members. Each field has its own type, which could be any valid Go type, including another struct. Structs are useful for grouping related data together to form complex data structures. 

## How to Create a Struct 

Creating a struct in Go is simple. All you need to do is define the type name followed by the fields it contains in curly braces: 
```go 
type Person struct { 
    Name string 
    Age int 
} 
```  
This creates a new type called `Person` with two fields: `Name` (a string) and `Age` (an integer). You can then create instances of this type by using the `new()` function: 
```go 
p := new(Person) // creates an instance of Person with default values for its fields  
```  

 You can also use the shorthand syntax to create an instance of the struct with specific values for its fields:  
 ```go  
 p := Person{Name: "John", Age: 25} // creates an instance of Person with Name set to "John" and Age set to 25  
 ```  
 ## Accessing Struct Fields

 Once you have created an instance of your struct, you can access its fields using dot notation:  

 ```go  
 p := Person{Name: "John", Age: 25} // creates an instance of Person with Name set to "John" and Age set to 25  
 fmt.Println(p.Name) // prints "John"  
 fmt.Println(p.Age) // prints 25  
 ```   

 ## Adding Methods To Structs

You can also add methods to your structs, which allows you to define behavior associated with your custom types. For example, if we wanted our `Person` type to have a method called `Greet()`, we could do so like this:   

```go   
func (p *Person) Greet() {     // defines a method called Greet on our Person type
    fmt.Printf("Hello, my name is %s\n", p.Name) 
}
p := Person{Name: "John", Age: 25} 
p.Greet() // prints "Hello, my name is John"
```
This allows us to easily add behavior associated with our custom types without having to write separate functions for each one.
## Conclusion
Golang structs are powerful tools for organizing data in Go programs. They allow us to create custom types that contain related data as well as methods that define behavior associated with those types. By taking advantage of these features, we can make our code more efficient and organized while still maintaining readability and maintainability.
