# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
* Added disabledEventDispatcher, which can be used to disable sending all events to Optimizely's results backend

## 0.3.0-beta1
* Remove js-web-sdk dependency, add optimizely-sdk dependency.
* Refactor to use ReactSDKClient as the interface between the core Optimizely SDK and the React SDK
* Add support for re-rendering after user or datafile updates, via the `autoUpdate` prop on the `OptimizelyExperiment` and `OptimizelyFeature` components

## 0.2.0-beta1
* Introduce server side rendering capability.  See [README](./README.md) for more information on how to implement.

## 0.1.1-beta1
* Fix formatting errors in README

## 0.1.0-beta1
* Beta release of the ReactSDK
