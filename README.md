# ShiftCare Appointment Scheduler

A React Native app built as part of the ShiftCare technical challenge. The app lets users browse doctors, check their weekly availability, and book 30-minute appointments.

## Getting Started

### What you need
- Node.js (I used v22)
- Expo Go app on your phone (make sure its version 54) This is becuase i faced a huge issue of compatibility with the Expo go app version and the the expo version 55 - the app only supports version 54.0.2
- A phone or simulator - i tested on my iphone 14 pro max

### Installation

Clone the repo and install dependencies:
```bash
npm install
```

Start the app:
```bash
npx expo start
```

Scan the QR code with Expo Go on your phone and the app should load up.

### Running Tests
```bash
npm test
```

## How the app works

When you open the app you'll see a list of doctors pulled from the API thats been given. Tap on a doctor to see their weekly schedule broken down into 30 minute slots (i though of using the calender library but had few hurdles of compatibility and given the time i desided to go weekly slots). Then Tap a slot to book it, confirm the details on the next screen, and thats it. You can view and cancel your bookings from the My Bookings tab at the bottom.

## Assumptions I made

- **No authentication** - the challenge said to keep it simple so bookings are just saved locally on the device using AsyncStorage. In a real app you would have user accounts and a proper backend.

- **Timezone** - the API returns a timezone for each doctor (like Australia/Sydney). I display this to the user but I dont convert the times to the users local timezone. The times shown are in the doctors timezone. This felt like the right call because you probably want to know what time the doctor is available in their timezone, not yours.

- **Weekly schedule** - I assumed the schedule repeats every week. The API doesnt give specific dates, just days like "Monday" and "Tuesday", so I treated them as recurring weekly availability.

- **One device one user** - since theres no login, whoever uses the app on that device uses the same bookings. Not ideal for production but fine for this challenge.

## Tecnical parts

- **Expo** - made setup way easier and the challenge allowed it which was a great timesaver.
- **Redux Toolkit** - used for state management as suggested in the bonus points. Makes the booking state predictable and easy to test
- **AsyncStorage** - persists bookings between app sessions as required
- **React Navigation** - stack navigation for the booking flow (doctors → detail → confirm) with bottom tabs for quick switching between Doctors and My Bookings
- **TypeScript** - used throughout for type safety. Caught a few bugs during development that would have been annoying to debug at runtime

## Known issues and limitations

- After confirming a booking, the "View My Bookings" button takes you to the Doctors tab instead of directly to My Bookings. This is a nested navigation issue (stack inside tabs) — fixable with a navigation ref but I ran out of time to implement it cleanly.

- Bookings dont persist if you completely reinstall the app since AsyncStorage is tied to the app installation.

- No real date picker — the schedule shows day names (Monday, Tuesday etc.. ) rather than actual calendar dates. A proper calendar UI would be a nice improvement. I faced a few hurdles trying to use a library so i ditched that approach given the time is limited.

- The app assumes the API is always available. If the API goes down the user sees an error with a retry button but theres no offline caching of the doctor list.

## What I would do with more time

- Add proper calendar UI so users can pick specific dates not just days of the week
- Add authentication so each user has their own bookings
- Cache the doctor list so it works offline
- Add push notifications to remind users of upcoming appointments
- Clean up the navigation so the "View My Bookings" redirect works properly
- Add more test coverage for the screen components themselves
- Maybe adding an AI agent to do smart scheduling and messaging