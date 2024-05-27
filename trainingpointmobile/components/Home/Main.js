import { Text, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, StyleSheet } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import BanTin from '../BanTin/BanTin';
import ThemTroLySinhVien from './ThemTroLySinhVien';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OTP from '../TaiKhoan/OTP';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MyContext from '../../configs/MyContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StackNavigator = () => (
    <Stack.Navigator initialRouteName="OTP">
        <Stack.Screen name="OTP" component={OTP} />
        {/* Thêm các màn hình khác nếu cần */}
    </Stack.Navigator>
);

const Main = ({ navigation }) => {
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = React.useContext(MyContext);
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => (
                <BottomNavigation.Bar
                    navigationState={state}
                    safeAreaInsets={insets}
                    onTabPress={({ route, preventDefault }) => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (event.defaultPrevented) {
                            preventDefault();
                        } else {
                            navigation.dispatch({
                                ...CommonActions.navigate(route.name, route.params),
                                target: state.key,
                            });
                        }
                    }}
                    renderIcon={({ route, focused, color }) => {
                        const { options } = descriptors[route.key];
                        if (options.tabBarIcon) {
                            return options.tabBarIcon({ focused, color, size: 24 });
                        }

                        return null;
                    }}
                    getLabelText={({ route }) => {
                        const { options } = descriptors[route.key];
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.title;

                        return label;
                    }}
                />
            )}
        >
            <Tab.Screen
                name="BanTin"
                component={BanTin}
                options={{
                    tabBarLabel: 'Bản tin',
                    tabBarIcon: ({ color, size }) => {
                        return <Icon name="home" size={size} color={color} />;
                    },
                }}
            />
            {role == 1 && <Tab.Screen
                
                name="OTP"
                component={OTP}
                options={{
                    tabBarLabel: 'OTP',
                    tabBarIcon: ({ color, size }) => {
                        return <Icon name="home" size={size} color={color} />;
                    },
                }}
            />}
            {role == 2 && <Tab.Screen
                name="ThemTroLySinhVien"
                component={ThemTroLySinhVien}
                options={{
                    tabBarLabel: 'Thêm trợ lý',
                    tabBarIcon: ({ color, size }) => {
                        return <Icon name="cog" size={size} color={color} />;
                    },
                }}
            />}
            <Tab.Screen
                name="Stack"
                component={StackNavigator}
                options={{
                    tabBarLabel: 'Stack',
                    tabBarIcon: ({ color, size }) => {
                        return <Icon name="cog" size={size} color={color} />;
                    },
                }}
            />
        </Tab.Navigator>
    )
}


export default Main;  