# 🔥 Firebase Todo App with TanStack Start

A real-time todo application built with Firebase Realtime Database and TanStack Start, featuring live synchronization across all devices.

## ✨ Features

- **Real-time Synchronization**: Changes appear instantly across all connected devices
- **Persistent Storage**: All todos are stored in Firebase Realtime Database
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Error Handling**: Comprehensive error management and user feedback
- **TypeScript**: Fully typed for better development experience
- **Server-Side Rendering**: Fast initial page loads with TanStack Start

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm
- Firebase project with Realtime Database enabled

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd tanstack-starters/firebase
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Firebase Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Realtime Database
   - Copy your Firebase configuration
   - Update `src/firebase.ts` with your config

4. **Run the development server:**
   ```bash
   bun run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🛠️ Configuration

### Firebase Configuration

Update `src/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### Database Rules

For development, use these permissive rules (⚠️ **NOT for production**):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, use more secure rules (see `database-rules.json` for examples):

```json
{
  "rules": {
    "todos": {
      ".read": true,
      ".write": true,
      "$todoId": {
        ".validate": "newData.hasChildren(['text', 'completed', 'createdAt'])",
        "text": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 500"
        },
        "completed": {
          ".validate": "newData.isBoolean()"
        },
        "createdAt": {
          ".validate": "newData.isNumber() && newData.val() <= now"
        }
      }
    }
  }
}
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 with TanStack Start
- **Backend**: Firebase Realtime Database
- **Styling**: CSS-in-JS with responsive design
- **State Management**: React hooks with Firebase real-time listeners
- **TypeScript**: Full type safety throughout the application

### Project Structure

```
src/
├── firebase.ts           # Firebase configuration and initialization
├── styles.css           # Global styles and animations
├── routes/
│   ├── __root.tsx       # Root layout component
│   └── index.tsx        # Main todo app component
└── routeTree.gen.ts     # Generated route tree (auto-generated)
```

### Data Structure

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
```

Firebase Database Structure:
```json
{
  "todos": {
    "unique-id-1": {
      "text": "Learn Firebase",
      "completed": false,
      "createdAt": 1704123456789
    },
    "unique-id-2": {
      "text": "Build todo app",
      "completed": true,
      "createdAt": 1704123456790
    }
  }
}
```

## 📱 Features in Detail

### Real-time Synchronization

The app uses Firebase's `onValue` listener to automatically sync data:

```typescript
useEffect(() => {
  const todosRef = ref(database, "todos");
  const unsubscribe = onValue(todosRef, (snapshot) => {
    const data = snapshot.val();
    // Update local state with new data
    setTodos(processData(data));
  });
  return () => unsubscribe();
}, []);
```

### CRUD Operations

- **Create**: Add new todos with `push()`
- **Read**: Real-time data fetching with `onValue()`
- **Update**: Toggle completion status with `update()`
- **Delete**: Remove todos with `remove()`

### Error Handling

- Network error handling
- Firebase operation error handling
- User-friendly error messages
- Automatic error dismissal

### Responsive Design

- Mobile-first approach
- Flexible layouts that work on all screen sizes
- Touch-friendly interactions
- Optimized for both desktop and mobile

## 🎨 Styling

The app uses a modern, clean design with:

- Smooth animations and transitions
- Hover effects and visual feedback
- Dark mode support (system preference)
- Consistent color scheme
- Accessible design patterns

### Customization

You can customize the appearance by modifying `src/styles.css`:

- Colors and themes
- Animations and transitions
- Layout and spacing
- Typography and fonts

## 🔧 Development

### Available Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run basic JavaScript file
bun run index.ts
```

### Development Tips

1. **Real-time Testing**: Open multiple browser tabs to see real-time sync
2. **Network Simulation**: Use browser dev tools to test offline scenarios
3. **Error Testing**: Temporarily disable Firebase to test error handling
4. **Performance**: Use React DevTools to monitor component re-renders

## 🚀 Deployment

### Build for Production

```bash
bun run build
```

### Deploy to Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting:**
   ```bash
   firebase init hosting
   ```

4. **Deploy:**
   ```bash
   firebase deploy
   ```

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

## 📊 Performance Optimization

### Firebase Optimization

- Use specific database paths for targeted queries
- Implement proper indexing for large datasets
- Use database rules to prevent unnecessary data transfer
- Consider using Firebase Analytics for usage insights

### React Optimization

- Memoize components where appropriate
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Optimize re-renders with useMemo and useCallback

## 🔐 Security

### Database Security

- Never use permissive rules in production
- Implement proper authentication
- Validate all data on the server side
- Use security rules to prevent unauthorized access

### Best Practices

- Keep Firebase config in environment variables
- Use HTTPS for all communications
- Implement proper error handling
- Regular security audits

## 🐛 Troubleshooting

### Common Issues

1. **"window is not defined" error**: 
   - Ensure Firebase Analytics is only initialized on client side
   - Check SSR compatibility

2. **Connection errors**:
   - Verify Firebase configuration
   - Check network connectivity
   - Ensure Firebase project is active

3. **Permission denied**:
   - Check Firebase database rules
   - Verify authentication status
   - Review rule simulation in Firebase Console

### Debug Mode

Enable debug mode by adding to your Firebase config:

```typescript
// Enable debug mode
if (process.env.NODE_ENV === 'development') {
  connectDatabaseEmulator(database, 'localhost', 9000);
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for the excellent real-time database
- [TanStack Start](https://tanstack.com/start) for the modern React framework
- [React](https://reactjs.org/) for the component library
- [TypeScript](https://www.typescriptlang.org/) for type safety

## 📚 Learn More

- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Happy coding! 🎉**