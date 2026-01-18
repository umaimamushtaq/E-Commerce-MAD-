import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Api } from "./Services/Api";


export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const { email } = useLocalSearchParams<{ email: string }>();

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    const formattedSeconds = seconds.toString().padStart(2, "0")

    return `${minutes}:${formattedSeconds}`
  }


  const handleConfirmOtp = async () => {
    setError("");
    setInfoMsg("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6 digit OTP");
      return;
    }

    try {
      await Api.post("/User/VerifyOtp", {
        email,
        otp,
      });

      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data || "Invalid or expired OTP");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfoMsg("");

    try {
      await Api.post("/User/SendOtp", { email });

      setOtp("");
      setTimeLeft(300);
      setInfoMsg("A new OTP has been sent to your email");
    } catch (err: any) {
      setError(err.response?.data || "Failed to resend OTP");
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>OTP Verification</Text>
        </View>


      {/* Content Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We have sent a 6 digit code to your email
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={(text) => {
            setOtp(text);
            setError("");
          }}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          placeholder=" • • • • • •"
        />

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Info message (OTP resent) */}
        {infoMsg ? <Text style={styles.infoText}>{infoMsg}</Text> : null}

        {/* Timer */}
        <Text style={styles.timerText}>
          {timeLeft > 0
            ? `Time remaining: ${formatTime()}`
            : "OTP expired"}
        </Text>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[
              styles.btnSecondary,
              timeLeft > 0 && styles.disabled,
            ]}
            disabled={timeLeft > 0}
            onPress={handleResendOtp}
          >
            <Text style={styles.btnSecondaryText}>Resend OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmOtp}>
            <Text style={styles.btnPrimaryText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingTop: 20,
  backgroundColor: "#fff",
  justifyContent: "flex-start", 
},

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10, 
  },

  header: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 20,
  marginBottom: 10,
},


  backText: {
    marginLeft: 10,
    marginTop: 6,
    fontSize: 14,
    color: "#4CAF50",
  },

  card: {
  marginTop: 130, 
  marginHorizontal: 20,
  paddingVertical: 30,
  paddingHorizontal: 20,
  borderRadius: 12,
  backgroundColor: "#f9f9f9",
  borderWidth: 1,
  borderColor: "#ddd",
  alignItems: "center",
},

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },

  otpInput: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 20,
    letterSpacing: 8,
    backgroundColor: "#fff",
    paddingLeft: 20
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 6,
  },

  infoText: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 6,
  },

  timerText: {
    fontSize: 14,
    color: "#555",
    marginTop: 18,
  },

  btnRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 30,
  },

  btnPrimary: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  btnPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  btnSecondary: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  btnSecondaryText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.5,
  },
});
