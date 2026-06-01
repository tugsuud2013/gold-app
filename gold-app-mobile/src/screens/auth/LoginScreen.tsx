import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GOLD_BTN = ['#F5D061', '#D4AF37', '#9A7B2E'] as const;
const APP_LOGO = require('../../../assets/images/app-logo.png');

const LoginBackground = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={160} height={120} style={styles.chartSvg}>
      <Defs>
        <SvgGradient id="chartGold" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={theme.colors.primaryDark} stopOpacity="0.2" />
          <Stop offset="0.5" stopColor={theme.colors.primary} stopOpacity="0.85" />
          <Stop offset="1" stopColor={theme.colors.primaryLight} stopOpacity="1" />
        </SvgGradient>
      </Defs>
      <Path
        d="M8 95 Q35 70 55 72 T95 28 L130 12"
        stroke="url(#chartGold)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      {[
        { cx: 8, cy: 95 },
        { cx: 55, cy: 72 },
        { cx: 95, cy: 28 },
        { cx: 130, cy: 12 },
      ].map((p, i) => (
        <Circle key={i} cx={p.cx} cy={p.cy} r={i === 3 ? 4 : 2.5} fill={theme.colors.primaryLight} opacity={0.55 + i * 0.1} />
      ))}
      <Circle cx={118} cy={20} r={1.5} fill={theme.colors.primaryLight} opacity={0.4} />
      <Circle cx={108} cy={32} r={1} fill={theme.colors.primaryLight} opacity={0.35} />
      <Circle cx={125} cy={8} r={1} fill={theme.colors.primaryLight} opacity={0.3} />
    </Svg>

    <LinearGradient
      colors={['transparent', 'rgba(139, 105, 20, 0.12)', 'rgba(212, 175, 55, 0.18)']}
      style={styles.bottomGlow}
    />

    <View style={styles.goldBars}>
      <LinearGradient colors={['#6B5210', '#B8962E', '#F0D878']} style={[styles.goldBar, styles.bar1]} />
      <LinearGradient colors={['#5A4610', '#A88428', '#E8CC6A']} style={[styles.goldBar, styles.bar2]} />
      <LinearGradient colors={['#7A5E14', '#C9A032', '#FFE08A']} style={[styles.goldBar, styles.bar3]} />
      <View style={styles.nuggetRow}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.nugget,
              {
                width: 4 + (i % 3) * 2,
                height: 4 + (i % 2) * 2,
                opacity: 0.25 + (i % 4) * 0.12,
                marginLeft: i === 0 ? 0 : 6 + (i % 2) * 4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  </View>
);

const GoldLogo = () => (
  <View style={styles.logoWrap}>
    <LinearGradient
      colors={['rgba(212, 175, 55, 0.28)', 'transparent']}
      style={styles.logoGlow}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
    <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" accessibilityLabel="GoldApp logo" />
  </View>
);

type FieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  keyboardType?: 'default' | 'phone-pad';
};

const AuthField = ({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  showPassword,
  onTogglePassword,
  keyboardType = 'default',
}: FieldProps) => (
  <View style={styles.fieldBlock}>
    <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
      <Ionicons name={icon} size={22} color={theme.colors.primary} style={styles.inputIcon} />
      <View style={styles.inputBody}>
        <Text style={styles.innerLabel}>{label}</Text>
        <TextInput
          style={styles.innerInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.38)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {onTogglePassword ? (
        <Pressable onPress={onTogglePassword} hitSlop={10} accessibilityRole="button">
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={theme.colors.primary}
          />
        </Pressable>
      ) : null}
    </View>
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

export const LoginScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { loginMutation } = useAuth();

  const handleLogin = () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    let hasError = false;

    if (!trimmedPhone) {
      setPhoneError('Утасны дугаараа оруулна уу.');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (!trimmedPassword) {
      setPasswordError('Нууц үгээ оруулна уу.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;
    loginMutation.mutate({ phone: trimmedPhone, password: trimmedPassword });
  };

  return (
    <View style={styles.root}>
      <LoginBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <GoldLogo />
              <Text style={styles.brandTitle}>GoldApp</Text>
              <Text style={styles.brandSubtitle}>Digital Gold. Real Value.</Text>
            </View>

            <View style={styles.form}>
              <AuthField
                icon="phone-portrait-outline"
                label="Утасны дугаар"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (phoneError) setPhoneError('');
                }}
                placeholder="88 1234 5678"
                error={phoneError}
                keyboardType="phone-pad"
              />

              <AuthField
                icon="lock-closed-outline"
                label="Нууц үг"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="••••••••"
                error={passwordError}
                secureTextEntry={!showPassword}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
              />

              <Pressable style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Нууц үг мартсан уу?</Text>
              </Pressable>

              {loginMutation.error ? (
                <Text style={styles.apiError}>{loginMutation.error.message}</Text>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                style={({ pressed }) => [styles.loginBtnOuter, pressed && styles.loginBtnPressed]}
              >
                <LinearGradient
                  colors={[...GOLD_BTN]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.loginBtnGradient}
                >
                  {loginMutation.isPending ? (
                    <ActivityIndicator color="#111111" />
                  ) : (
                    <Text style={styles.loginBtnText}>Нэвтрэх</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Бүртгэлгүй юу? </Text>
                <Pressable
                  style={styles.footerLinkWrap}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.footerLink}>Бүртгүүлэх</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  chartSvg: {
    position: 'absolute',
    top: 36,
    right: 4,
    opacity: 0.92,
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.38,
  },
  goldBars: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 8,
    opacity: 0.55,
  },
  goldBar: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 120, 0.25)',
  },
  bar1: {
    width: 52,
    height: 22,
    marginRight: 6,
    transform: [{ rotate: '-8deg' }],
    marginBottom: 4,
  },
  bar2: {
    width: 68,
    height: 28,
    marginRight: 8,
    transform: [{ rotate: '4deg' }],
    marginBottom: 0,
  },
  bar3: {
    width: 44,
    height: 18,
    transform: [{ rotate: '-5deg' }],
    marginBottom: 10,
  },
  nuggetRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 6,
    paddingLeft: 8,
  },
  nugget: {
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.huge + theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  logoWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    top: -12,
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.text,
    letterSpacing: 0.6,
    opacity: 0.92,
  },
  form: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 56,
    alignSelf: 'center',
    zIndex: 1,
  },
  fieldBlock: {
    marginBottom: theme.spacing.lg,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#252525',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 68,
  },
  inputWrapError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    marginRight: 14,
    marginTop: 4,
  },
  inputBody: {
    flex: 1,
    justifyContent: 'center',
  },
  innerLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  innerInput: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '500',
    padding: 0,
    margin: 0,
    minHeight: 24,
  },
  fieldError: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: theme.spacing.xl,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  apiError: {
    color: theme.colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  loginBtnOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnPressed: {
    opacity: 0.92,
  },
  loginBtnGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  loginBtnText: {
    color: '#0D0D0D',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    zIndex: 1,
  },
  footerText: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.85,
  },
  footerLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
});
