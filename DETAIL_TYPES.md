# Todo Detail Types and Icons Reference

This document lists all supported detail types that can be displayed in todo cards, along with their associated icons and display formats.

## People & Teams

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `employee` | 👤 | `{employee}` | `👤 Mike` |
| `assignedTo` | 👥 | `{assignedTo}` | `👥 Team A` |
| `supervisor` | 👔 | `{supervisor}` | `👔 John` |
| `shift` | 🕐 | `{shift}` | `🕐 Day` |
| `teamSize` | 👨‍👩‍👧‍👦 | `Team: {teamSize}` | `👨‍👩‍👧‍👦 Team: 5` |

## Location & Movement

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `zone` | 📍 | `{zone}` | `📍 Reefer Zone 3` |
| `location` | 📍 | `{location}` | `📍 Conference Room A` |
| `fromLocation` | ⬅️ | `From: {fromLocation}` | `⬅️ From: Zone A` |
| `toLocation` | ➡️ | `To: {toLocation}` | `➡️ To: Zone B` |
| `aisle` | 🗺️ | `Aisle: {aisle}` | `🗺️ Aisle: 3-B` |
| `dock` | 🚢 | `Dock: {dock}` | `🚢 Dock: 2` |

## Equipment & Assets

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `equipmentId` | 🔧 | `Equipment: {equipmentId}` | `🔧 Equipment: FL-003` |
| `vehicleId` | 🚛 | `Vehicle: {vehicleId}` | `🚛 Vehicle: Forklift #5` |
| `machineStatus` | ⚙️ | `Status: {machineStatus}` | `⚙️ Status: Running` |
| `assetTag` | 🏷️ | `Asset: {assetTag}` | `🏷️ Asset: A-12345` |

## Orders & Inventory

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `orderNumber` | 📦 | `{orderNumber}` | `📦 ON12345678` |
| `orderStatus` | 📝 | `Order: {orderStatus}` | `📝 Order: Pending` |
| `inventoryLevel` | 📉 | `Stock: {inventoryLevel}` | `📉 Stock: Low` |
| `batchNumber` | 🔢 | `Batch: {batchNumber}` | `🔢 Batch: B-2024-001` |
| `lotNumber` | 🎫 | `Lot: {lotNumber}` | `🎫 Lot: L-789` |

## Quantity & Volume

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `quantity` | 📊 | `Qty: {quantity}` | `📊 Qty: 150 units` |
| `weight` | ⚖️ | `Weight: {weight}` | `⚖️ Weight: 250 lbs` |
| `volume` | 📦📦 | `Volume: {volume}` | `📦📦 Volume: 50 cu ft` |
| `palletCount` | 🗂️ | `Pallets: {palletCount}` | `🗂️ Pallets: 12` |

## Time & Urgency

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `cutoffMinutes` | ⏱️ | `Cutoff in {cutoffMinutes} min` | `⏱️ Cutoff in 11 min` |
| `timeRemaining` | ⏰ | `Time remaining: {timeRemaining}` | `⏰ Time remaining: 5 min` |
| `deadline` | 🕐 | `Deadline: {deadline}` | `🕐 Deadline: 2:00 PM` |
| `escalationLevel` | ⚠️ | `Escalation: {escalationLevel}` | `⚠️ Escalation: Level 2` |
| `slaMinutes` | ⏳ | `SLA: {slaMinutes} min remaining` | `⏳ SLA: 15 min remaining` |

## Environmental

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `temperature` | 🌡️ | `{temperature}` | `🌡️ -18.5°C` |
| `humidity` | 💧 | `Humidity: {humidity}` | `💧 Humidity: 65%` |
| `pressure` | 🌪️ | `Pressure: {pressure}` | `🌪️ Pressure: Normal` |
| `lighting` | 💡 | `Lighting: {lighting}` | `💡 Lighting: Adequate` |

## Status & Condition

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `condition` | ✅ | `Condition: {condition}` | `✅ Condition: Good` |
| `qualityStatus` | ⭐ | `Quality: {qualityStatus}` | `⭐ Quality: Pass` |
| `severity` | 🔴 | `Severity: {severity}` | `🔴 Severity: High` |
| `statusCode` | 🏷️ | `Status: {statusCode}` | `🏷️ Status: In Progress` |

## Safety & Compliance

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `safetyLevel` | 🦺 | `Safety: {safetyLevel}` | `🦺 Safety: Required` |
| `complianceStatus` | 📋 | `Compliance: {complianceStatus}` | `📋 Compliance: Pending` |
| `incidentType` | 🚨 | `Incident: {incidentType}` | `🚨 Incident: Spill` |
| `certification` | 🎓 | `Cert: {certification}` | `🎓 Cert: Required` |

## Communication & Escalation

| Detail Type | Icon | Display Format | Example |
|------------|------|----------------|---------|
| `notificationCount` | 🔔 | `Notifications: {notificationCount}` | `🔔 Notifications: 3` |
| `escalatedBy` | 📢 | `Escalated by: {escalatedBy}` | `📢 Escalated by: System` |
| `priorityReason` | 💬 | `Reason: {priorityReason}` | `💬 Reason: Urgent` |
| `relatedTodoCount` | 🔗 | `Related: {relatedTodoCount} todos` | `🔗 Related: 2 todos` |

## Usage Notes

- All detail types are optional and will only display if present in the `todo.details` object
- Multiple detail types can be displayed simultaneously
- Details are displayed in a flex-wrap layout, so they will wrap to multiple lines if needed
- The `externalLink` field is used internally for dynamic todos but is not displayed as a detail icon

## Implementation

Details are rendered in the `TodoCard` component within the `todo-details` div. Each detail type is conditionally rendered based on its presence in the `todo.details` object.

























