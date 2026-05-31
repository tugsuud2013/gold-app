import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PurchaseScreen } from '../screens/purchase/PurchaseScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { NewsListScreen } from '../screens/news/NewsListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { theme } from '../theme';
import { ContractScreen } from '../screens/purchase/ContractScreen';
import { PaymentScreen } from '../screens/purchase/PaymentScreen';
import { PurchaseSuccessScreen } from '../screens/purchase/PurchaseSuccessScreen';
import { KycScreen } from '../screens/kyc/KycScreen';
import { GoldPriceScreen } from '../screens/goldPrice/GoldPriceScreen';
import { NewsDetailScreen } from '../screens/news/NewsDetailScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { ContractListScreen } from '../screens/profile/ContractListScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();
const NewsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

export type PurchaseFlowParams = {
  PurchaseMain: undefined;
  Contract: { grams: number; pricePerGram: number };
  Payment: { purchaseId: string; grams: number; totalAmount: number; qrImageBase64?: string };
  PurchaseSuccess: { purchaseId: string; grams: number; totalAmount: number; transactionId?: string };
};

const PurchaseStack = createNativeStackNavigator<PurchaseFlowParams>();

const PurchaseFlowNavigator = () => (
  <PurchaseStack.Navigator screenOptions={{ headerShown: false }}>
    <PurchaseStack.Screen name="PurchaseMain" component={PurchaseScreen} />
    <PurchaseStack.Screen name="Contract" component={ContractScreen} />
    <PurchaseStack.Screen name="Payment" component={PaymentScreen} />
    <PurchaseStack.Screen name="PurchaseSuccess" component={PurchaseSuccessScreen} />
  </PurchaseStack.Navigator>
);

const HomeFlowNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="GoldPrice" component={GoldPriceScreen} />
    <HomeStack.Screen name="NewsDetail" component={NewsDetailScreen} />
    <HomeStack.Screen name="Chat" component={ChatScreen} />
  </HomeStack.Navigator>
);

const WalletFlowNavigator = () => (
  <WalletStack.Navigator screenOptions={{ headerShown: false }}>
    <WalletStack.Screen name="WalletMain" component={WalletScreen} />
    <WalletStack.Screen name="ContractList" component={ContractListScreen} />
  </WalletStack.Navigator>
);

const NewsFlowNavigator = () => (
  <NewsStack.Navigator screenOptions={{ headerShown: false }}>
    <NewsStack.Screen name="NewsMain" component={NewsListScreen} />
    <NewsStack.Screen name="NewsDetail" component={NewsDetailScreen} />
  </NewsStack.Navigator>
);

const ProfileFlowNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <ProfileStack.Screen name="ContractList" component={ContractListScreen} />
  </ProfileStack.Navigator>
);

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Нүүр': 'home',
  Wallet: 'wallet',
  'Худалдаа': 'cart',
  'Мэдээ': 'newspaper',
  'Профайл': 'person',
};

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.colors.tabBar,
        borderTopColor: theme.colors.border,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={tabIcons[route.name]} size={size} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Нүүр" component={HomeFlowNavigator} />
    <Tab.Screen name="Wallet" component={WalletFlowNavigator} />
    <Tab.Screen name="Худалдаа" component={PurchaseFlowNavigator} />
    <Tab.Screen name="Мэдээ" component={NewsFlowNavigator} />
    <Tab.Screen name="Профайл" component={ProfileFlowNavigator} />
  </Tab.Navigator>
);

export const MainNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Tabs" component={Tabs} />
    <RootStack.Screen name="Kyc" component={KycScreen} />
  </RootStack.Navigator>
);
