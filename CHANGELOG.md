# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added possibility to change logged in AF user by clearing sso cookie.

### Fixed

- Catch and recovery from a rejected sso cookie situation.
- Implemented handling when the authenticated user does not have any profiles. In that case, the user is informed and provided a link to add a new profile.

### Changed

- Adopted new AF-Portability response document/structure (HROpen-4.2-1)

## [1.0.0-beta]

### Fixed

- Fixed issue where the user selected profile was not stored in AF-Connect-Outbox.

## [0.1.0]

### Added

- Added use-choice "Consent"/"Consent reject" buttons to AF-Connect frontend.

### Removed

- Removed "jwt-service" module from project since this functionality is provided by af-portability.
