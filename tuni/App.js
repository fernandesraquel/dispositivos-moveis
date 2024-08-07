import * as React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const AuthContext = React.createContext();

function SplashScreen() {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

function EmptyScreen() {
  return <View />;
}

function HomeScreen() {
  const { signOut } = React.useContext(AuthContext);
  return (
    <View style={{alignItens: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20}}>
      <Text>Signed in!</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}

function UserIcon() {
  return (
    <View style={{ marginRight: 10 }}>
      <Ionicons name='person-circle-outline' size={48} color='gray'/>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Listas') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Conversas') {
          iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
        } else if (route.name === 'Notificações') {
          iconName = focused ? 'notifications' : 'notifications-outline';
        } else if (route.name === 'Rotas') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      headerRight: () => <UserIcon />,
    })}
    >
      <Tab.Screen 
        name="Listas" 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name="Conversas" 
        component={EmptyScreen} 
      />
      <Tab.Screen 
        name="Notificações" 
        component={EmptyScreen}
      />
      <Tab.Screen 
        name="Rotas" 
        component={EmptyScreen} 
      />
    </Tab.Navigator>
  );
}

function SignInScreen() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const { signIn } = React.useContext(AuthContext);

  return (
    <View style={{alignItens: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20}}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{padding: 8, borderWidth: 1, borderRadius: 6, marginBottom:20}}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{padding: 8, borderWidth: 1, borderRadius: 6, marginBottom:40}}
      />
      <Button title="Sign in" onPress={() => signIn({ username, password })} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App({ navigation }) {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        // Restore token stored in `SecureStore` or any other encrypted storage
        // userToken = await SecureStore.getItemAsync('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async (data) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.isLoading ? (
            // We haven't finished checking for the token yet
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : state.userToken == null ? (
            // No token found, user isn't signed in
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{
                title: 'Sign in',
                // When logging out, a pop animation feels intuitive
                animationTypeForReplace: state.isSignout ? 'pop' : 'push',
              }}
            />
          ) : (
            // User is signed in
            <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

