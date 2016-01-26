/// <reference path="../../orange.d.ts" />

namespace Injection {
    
    export class TestClassA {
        
       private type = "TestClassA"
       constructor() {
           
       } 
       
       someFunction(): string {
           return this.type;
       }
    }
    
    export class TestClassB {
       constructor(public testClassAInstance: TestClassA) {
           
       } 
    }
    
    export class TestClassC {
        
       private static dependencies = () => [ TestClassA ];
       constructor(public testClassAInstance: TestClassA) {
           
       } 
    }
    
    @Orange.Modularity.inject
    export class TestClassD {
       constructor(public testClassAInstance: TestClassA) {
           
       } 
    }
}