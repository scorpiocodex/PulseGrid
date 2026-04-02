# Changelog

All notable changes to PulseGrid will be documented in this file.

## [1.0.0] - 2024-04-02

### Added
- Real-time system metrics monitoring (CPU, Memory, Disk)
- Background metric collector service
- React-based dashboard with live updating charts
- Status state machine (Live / Updating / Offline)
- Fault-tolerant frontend with offline detection
- Data freshness indicator ("2s ago")
- Gradient-filled area charts with smooth animations

### Changed
- Removed API_KEY authentication (open by default)
- Improved chart visuals with gradient fills and tooltip styling
- Reduced retry attempts and added exponential backoff
- Added request timeout for resilience

### Fixed
- Data Points display now shows integers only
- Status flickering reduced with longer debounce
- Offline error spam reduced (requires 2 consecutive errors)
- Last updated timestamp freezes when offline

### Removed
- API_KEY configuration (deprecated)
- Unused dependencies

