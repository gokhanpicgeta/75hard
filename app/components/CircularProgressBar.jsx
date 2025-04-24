import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

const CircularProgress = ({
  progress, // progress percentage (0-100)
  size = 60, // overall size (width & height) of the circle
  strokeWidth = 10,
  failed,
  backgroundColor = "#e6e6e6", // color of the base circle
  //progressColor = "#ff5f6d", // color of the progress arc
}) => {
  const progressColor = failed ? "#ff5f6d" : "#B565F1";
  // Calculate the radius considering the stroke width
  const radius = (size - strokeWidth) / 2;
  // Circumference of the circle is 2πr
  const circumference = 2 * Math.PI * radius;
  // The offset is how much of the stroke is hidden - proportional to the progress
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Base Circle */}
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke={progressColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // To start the progress from the top, rotate by -90 degrees.
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {/* Centered Percentage Text */}
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <Text style={styles.percentageText}>{`${progress}%`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CircularProgress;
