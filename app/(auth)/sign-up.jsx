import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'

import { images } from "../../constants"
import FormField from "../../components/FormField"
import CustomButton from '../../components/CustomButton'
import { createUser } from '../../lib/appwrite'
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {

    const { setUser, setIsLogged } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: ''
    })

    const submit = async () => {
        if (form.username === "" || form.email === "" || form.password === "") {
            Alert.alert('Error', 'Please fill all fields');
        }

        setIsSubmitting(true);

        try {
            const result = await createUser(form.email, form.password, form.username);

            setUser(result);
            setIsLogged(true);
           
            router.replace('/home');

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView className='bg-primary h-full'>
            <ScrollView>
                <View className="w-full flex justify-center min-h-[83vh] px-4 my-6">
                    <Image
                        source={images.logo}
                        resizeMode="contain"
                        style={{ width: 115, height: 34 }}
                    />
                    <Text className="text-2xl font-semibold text-white  font-psemibold mt-10">
                        Sign Up to Aora
                    </Text>

                    <FormField
                        title="Username"
                        value={form.username}
                        handleChangeText={(e) => setForm({ ...form, username: e })}
                        otherStyles="mt-10"
                    />

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles="mt-7"
                    />

                    <CustomButton
                        title="Sign Up"
                        handlePress={submit}
                        containerStyles="mt-7"
                        isLoading={isSubmitting}
                    />

                    <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-gray-100 font-pregular">
                            Have an account already?
                        </Text>
                        <Link
                            href="/sign-in"
                            className="text-lg font-psemibold text-secondary">Sign in</Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp
