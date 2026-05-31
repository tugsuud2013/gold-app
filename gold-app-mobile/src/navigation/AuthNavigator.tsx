import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { phone: string };
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);
