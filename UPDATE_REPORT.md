# PLAN-Z Update Report

## Requested fixes

1. Requirement 2 Feature 1: event booking must support three ticket types for every event:
   - General Pass
   - VIP
   - Early Access

2. Organizers must be able to enter the price and quantity for each ticket type clearly.

3. The organizer create/edit event form should be simplified:
   - removed the Base Price input
   - removed editable/custom ticket names
   - kept fixed ticket categories only
   - added clear labels for ticket price and ticket quantity
   - removed image/image URL input from the organizer merchandise management form

## Backend changes

- Added `server/utils/ticketTypes.js`.
- Updated `server/models/Event.js` so every event is normalized to exactly three ticket categories.
- Updated `server/controllers/eventController.js` so creating, editing, fetching, and admin/organizer listing events normalizes old event records to the three ticket types.
- Updated `server/controllers/bookingController.js` so booking works with the fixed ticket categories and maps old names like Regular/General Admission to General Pass.
- Updated `server/models/Booking.js` default ticket type from Regular to General Pass.
- Updated `server/package.json` with a dev script and nodemon dev dependency.

## Frontend changes

- Added `client/src/utils/tickets.js` for shared ticket normalization.
- Updated `client/src/pages/OrganizerDashboard.jsx`:
  - removed Base Price field
  - removed editable ticket name field
  - added fixed ticket categories: General Pass, VIP, Early Access
  - added explicit labels such as “General Pass Price (৳)” and “General Pass Quantity”
  - removed image URL field from merchandise form
- Updated `client/src/pages/EventDetails.jsx` so attendees always see the three ticket types during booking.
- Updated `client/src/pages/Events.jsx` so event cards calculate “From ৳...” using the normalized ticket categories.

## Validation performed

- Ran backend JavaScript syntax checks with `node -c` on changed backend files.
- Ran frontend production build successfully with `npm run --prefix client build`.

## After extracting

1. Copy `server/.env.example` to `server/.env`.
2. Put your real MongoDB URI and JWT secret in `server/.env`.
3. Run backend:
   ```powershell
   cd E:\CSE470\plan-z\server
   npm install
   npm run dev
   ```
4. Run frontend:
   ```powershell
   cd E:\CSE470\plan-z\client
   npm install
   npm run dev
   ```

## What to test manually

1. Organizer creates an event and sees exactly three ticket categories.
2. Organizer enters separate price and quantity for General Pass, VIP, and Early Access.
3. Organizer edits the event and the three ticket categories remain visible.
4. Attendee opens event details and sees all three ticket options.
5. Attendee selects each ticket type and quantity and proceeds to payment.
6. Booking history shows the correct selected ticket type.
