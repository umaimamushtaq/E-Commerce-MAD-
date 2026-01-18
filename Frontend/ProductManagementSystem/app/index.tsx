import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Api } from "./Services/Api";


export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [loading, setLoading] = useState(false)

    const HandleSignUp = () => {
        router.push('/SignUp')
    }

    const isValidUsername = (username: string) => {
        // Allows: a-z, A-Z, 0-9, underscore (_), and period (.)
        const usernameRegex = /^[a-zA-Z0-9._]+$/
        return usernameRegex.test(username)
    }

    const ApiHandle = async (username: string, password: string) => {
        try {
            const response = await Api.post('User/Login', {
                username: username,
                password: password,
            })
            const data = response.data;

            if (!data.token || !data.user) {
                return { success: false, message: "Invalid response from server" }
            }

            await AsyncStorage.setItem('token', data.token)
            await AsyncStorage.setItem('user', JSON.stringify(data.user))

            return { success: true, role: data.user.role }

        }
        catch (error: any) {
            const errorMessage = error.response?.data || "Login Failed"
            return { success: false, message: errorMessage }
        }
    }

    const HandleLogin = async () => {
        let valid = true
        setUsernameError('')
        setPasswordError('')

        if (!username.trim()) {
            setUsernameError('Username is required')
            valid = false
        }
        else if (username.length < 3) {
            setUsernameError('Username must contain atleast 3 charaters')
            valid = false
        }
        else if (!isValidUsername(username)) {
            setUsernameError('Username can only contain letters,numbers,underscore and period')
            valid = false
        }
        if (password.length < 8) {
            setPasswordError('Password must be atleast 8 characters')
            valid = false
        }


        if (!valid)
            return

        setLoading(true)

        // backend call 
        const result = await ApiHandle(username, password)

        if (result.success) {
            setLoading(false)
            if (result.role == "Admin")
                router.replace("/(admin)/Home")
            else if (result.role == "User")
                router.replace("/(tabs)/Home")

        }
        else {
            setLoading(false)

            const msg = result.message
            if (msg.toLowerCase().includes("username")) {
                setUsernameError(msg)
                setPasswordError(msg)
            }
            else
                alert(msg)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.logoCont}>
                <Image style={styles.img}
                    source={require('../assets/images/Images/LogoWithName.png')}>
                </Image>
            </View>
            <View style={styles.login}>
                <View style={styles.loginCont}>
                    <Text style={styles.loginTxt}>Login</Text>
                    <View style={styles.inputCont}>
                        <View style={styles.fieldCont}>
                            <TextInput style={styles.txtInput}
                                placeholder="Username" placeholderTextColor={'#999'}
                                value={username} onChangeText={(text) => {
                                    setUsername(text);
                                    setUsernameError('')
                                }} maxLength={20}></TextInput>
                            {usernameError ? (
                                <Text style={styles.errorField}>{usernameError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.fieldCont}>
                            <TextInput style={styles.txtInput}
                                placeholder="Password" placeholderTextColor={'#999'}
                                value={password} onChangeText={(text) => {
                                    setPassword(text);
                                    setPasswordError('')
                                }}
                                secureTextEntry={true}></TextInput>
                            {passwordError ? (
                                <Text style={styles.errorField}>{passwordError}</Text>
                            ) : null}
                        </View>
                    </View>
                    <View style={styles.btnCont}>
                        <TouchableOpacity style={[styles.btnSignIn, loading && { opacity: 0.6 }]}
                            onPress={HandleLogin} disabled={loading}>
                            <Text style={styles.btnText}>{loading ? 'Signing In' : 'Sign In'}</Text>
                        </TouchableOpacity>
                        <View style={styles.rowSignUp}>
                            <Text style={styles.txtSignUp}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => HandleSignUp()}>
                                <Text style={styles.linkSignUp}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

        </ScrollView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        paddingTop: 30
    },

    logoCont: {
        marginBottom: 10,
        height: '11%',
        justifyContent: 'center',
        alignItems: 'center'
    },

    img: {
        width: 200,
        height: 80,
        resizeMode: 'contain',
    },

    login: {
        height: '80%',
        marginTop: '5%',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 100
    },

    loginCont: {
        width: '100%',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 30,
        paddingHorizontal: 20,
        margin: 0,
        backgroundColor: '#f9f9f9'
    },

    loginTxt: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: "#333"
    },

    fieldCont: {
        width: '100%',
    },

    inputCont: {
        width: '100%',
        marginTop: 30,
        paddingHorizontal: 10,
        gap: 20
    },

    txtInput: {
        width: '100%',
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: "#fff"
    },

    btnCont: {
        width: '100%',
        marginTop: 40,
        paddingHorizontal: 10,
        alignItems: 'center'
    },

    btnSignIn: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20
    },

    btnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold'
    },

    rowSignUp: {
        flexDirection: 'row',
        justifyContent: 'center'
    },

    txtSignUp: {
        fontSize: 15,
        color: '#666'
    },

    linkSignUp: {
        fontSize: 15,
        color: '#4CAF50',
        fontWeight: 'bold',
        textDecorationLine: "underline"
    },

    errorField: {
        color: 'red',
        fontSize: 11,
        alignSelf: 'flex-start',
        marginTop: 4,
        marginLeft: 10
    }
})