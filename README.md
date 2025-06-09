# Trial Secretary Program

A comprehensive web-based system for managing dog trials, tracking judges across multiple days, classes, and rounds.

![Trial Management System](https://img.shields.io/badge/Status-Active-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## 🚀 Live Demo

Access the application here: [Trial Secretary Program](https://yourusername.github.io/trial-secretary-program)

## ✨ Features

- **🏆 Trial Setup**: Configure multiple days with classes and judges
- **📝 Entry Management**: Register dogs with auto-complete registration numbers
- **📁 Data Import**: Upload JSON files with dog registration data
- **📊 Results Tracking**: Monitor entries and generate reports
- **👥 Multi-User Support**: Secretary login system with data persistence
- **💾 Local Storage**: Automatic saving of trial configurations
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔍 Auto-Complete**: Smart search for dog registration numbers

## 🎯 Quick Start

1. **Access the application** using the live demo link above
2. **Login** with your secretary name
3. **Upload JSON data** with dog registration information
4. **Setup your trial** by configuring days, classes, and judges
5. **Process entries** and track results

## 📋 Usage Guide

### Setting Up a Trial

1. **Login**: Enter your secretary name in the top-right corner
2. **Upload Data**: 
   - Click "Upload JSON Data" in the Trial Setup tab
   - Select your dog registration JSON file
   - System will automatically extract available classes and judges
3. **Configure Trial**:
   - Enter the number of trial days
   - For each day, set the date and number of classes
   - For each class, specify rounds and assign judges

### Managing Entries

1. Switch to the **Entry Form** tab
2. **Register Dogs**:
   - Type registration number (auto-complete available)
   - Select trial day, class, and round
   - Choose entry type (Regular or FEO)
   - Enter handler name
3. **View Results** in the Results tab

## 📄 Data Format

The system expects JSON data in this format:

```json
[
  {
    "regNumber": "13-0545-01",
    "callName": "Buddy",
    "className": "Novice A",
    "judge": "Judge Smith"
  },
  {
    "regNumber": "13-0545-02",
    "callName": "Luna",
    "className": "Open B",
    "judge": "Judge Johnson"
  }
]
```

### Required Fields:
- `regNumber`: Dog's registration number
- `callName`: Dog's call name
- `className`: Competition class (optional, can be empty)
- `judge`: Assigned judge name

## 🛠️ Technical Details

- **Frontend**: Pure HTML5, CSS3, and JavaScript
- **Storage**: Browser localStorage for data persistence
- **Hosting**: GitHub Pages (static hosting)
- **Dependencies**: None - runs entirely in the browser

## 🔧 Local Development

To run locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/trial-secretary-program.git
   ```

2. Open `index.html` in your web browser

3. No server setup required - it's a static web application!

## 📁 File Structure

```
trial-secretary-program/
├── index.html              # Main application file
├── data.json              # Sample dog registration data
├── README.md              # This file
└── LICENSE                # MIT License
```

## 🌟 Features in Detail

### Trial Configuration
- Multi-day trial support
- Flexible class and round structure
- Judge assignment per round
- Date tracking for each day

### Entry Processing
- Real-time registration number lookup
- Auto-complete for dog information
- Entry type selection (Regular/FEO)
- Handler name tracking

### Data Management
- JSON file import/export
- CSV export for results
- Local storage persistence
- Multi-secretary support

### User Interface
- Clean, professional design
- Tab-based navigation
- Responsive layout
- Real-time validation

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and version information

## 💡 Feature Requests

Have an idea for improvement? Open an issue and describe:
- The feature you'd like to see
- Why it would be useful
- How you envision it working

## 📞 Support

- 🐛 **Bug Reports**: [Create an Issue](https://github.com/yourusername/trial-secretary-program/issues)
- 💡 **Feature Requests**: [Create an Issue](https://github.com/yourusername/trial-secretary-program/issues)
- 📧 **General Questions**: Use the repository discussions

## 🎉 Acknowledgments

- Built for dog trial secretaries and organizers
- Designed with real-world trial management needs in mind
- Thanks to the dog training community for feedback and testing

---

⭐ **Star this repository if you find it useful!** ⭐
