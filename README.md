# Orange
TypeScript IoC container and dependency injection

[Getting started](../../Examples/Basics/basics.md)

## Requirements

Install grunt-cli (preferably globally) via npm

      npm install -g grunt-cli

## Build SampleApplication

### With Visual Studio

Open SampleApplication/SampleApplication.sln

### From console

Navigate to: 

    cd SampleApplication/SampleApplication

Install node dependencies

    npm install

Install bower dependencies

(If you haven't installed bower, it's recommended to install it globally: npm install -g bower)

    bower install

Install typescript definitions

(If you haven't installed tsd, it's recommended to install it globally: npm install -g tsd)

    tsd reinstall

Run grunt to compile application

      grunt
      
To automatically compile TypeScript files when saved on disk and reload the browser, run;

     grunt serve
  


## TODO

* Register Orange as an own bower package
* Set Orange as a dependency in bower.json
* Update app/_references.ts with path to bower_components/orange/Reference.d.ts