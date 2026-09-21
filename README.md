# Dobot Magician 2D Inverse Kinematics Simulator

An interactive, single-file 2D web simulation (HTML5 Canvas + Vanilla JavaScript) for testing and validating the **Dobot Magician** robotic arm inverse kinematics (IK) and forward kinematics (FK) formulas before implementing them in Unity C# or physical hardware.

## 🚀 Live Demo
[View Live Demo Website](https://chaitanyakrishnarajulapati.github.io/dobot-ik/)

---

## 🤖 Arm Geometry & Kinematics Specs

- **Base Offset Radius ($baseOffsetRadius$)**: $60\,\text{mm}$ (horizontal shift from base origin $(0,0)$ to shoulder pivot $(60,0)$)
- **Base Offset Height ($baseOffsetHeight$)**: $0\,\text{mm}$
- **Rear Arm ($L_1$, Shoulder Link)**: $135\,\text{mm}$
- **Forearm ($L_2$, Elbow Link)**: $147\,\text{mm}$
- **Reachable Workspace Bounds**: Min radius $|L_1 - L_2| = 12\,\text{mm}$, Max radius $L_1 + L_2 = 282\,\text{mm}$ from shoulder pivot.

---

## 🧮 Kinematic Formulas

### Inverse Kinematics (IK)
Given target cursor position $(x, y)$ relative to base origin $(0,0)$:

$$\begin{aligned}
dr &= x - baseOffsetRadius \\
dz &= y - baseOffsetHeight \\
radius &= \sqrt{dr^2 + dz^2} \\
\gamma &= \text{atan2}(dz, dr) \\
\cos(\beta) &= \frac{radius^2 - L_1^2 - L_2^2}{-2 \cdot L_1 \cdot L_2}
\end{aligned}$$

- **Reachability Check**: If $\cos(\beta) < -1$ or $\cos(\beta) > 1$, the target is **UNREACHABLE**. The simulator freezes the arm at its last valid pose and highlights the cursor target in red.
- **Joint Angles**:
$$\begin{aligned}
\beta &= \text{acos}(\cos\beta) \\
\alpha &= \text{asin}\left(\text{clamp}\left(\frac{L_2 \cdot \sin\beta}{radius}, -1, 1\right)\right) \\
j_2 &= 90^\circ - \alpha - \gamma \\
j_3 &= 180^\circ - \beta - \alpha - \gamma
\end{aligned}$$

### Forward Kinematics (FK)
$$\begin{aligned}
elbow_x &= baseOffsetRadius + L_1 \cdot \sin(j_2) \\
elbow_y &= baseOffsetHeight + L_1 \cdot \cos(j_2) \\
tip_x &= elbow_x + L_2 \cdot \cos(j_3) \\
tip_y &= elbow_y - L_2 \cdot \sin(j_3)
\end{aligned}$$

---

## ✨ Features

- **Interactive Dragging**: Click and drag anywhere on the canvas to move the end-effector.
- **Smooth Angle Lerping**: Smooth interpolation between joint angles.
- **Reachable Range Annulus**: Visual representation of the minimum and maximum reach limits.
- **Live Readout Panel**: Real-time display of $J_2$, $J_3$, target coordinates, FK tip coordinates, and reach status.
- **End-Effector Switcher**: Toggle between **Gripper** (Open/Closed), **Suction Cup** (Vacuum ON/OFF), and **Laser** (Beam ON/OFF).
- **Standalone Single File**: Zero dependencies, open `index.html` in any browser.

---

## 📄 License
MIT License. Free for educational and research use.
