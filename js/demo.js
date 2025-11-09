// ============================================
// THINKCONTROL BCI - DEMO SIMULATION
// ============================================

class BCIDemo {
    constructor() {
        this.isRunning = false;
        this.canvas = document.getElementById('eegCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentPrediction = 0; // 0 = left, 1 = right
        this.confidence = 0.5;
        this.cursorPosition = 50; // Percentage (50 = center)
        this.hitsLeft = 0;
        this.hitsRight = 0;
        this.history = [];
        
        // EEG simulation
        this.eegData = {
            c3: [],
            c4: [],
            cz: []
        };
        
        this.setupCanvas();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 300;
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('randomBtn').addEventListener('click', () => this.randomPrediction());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }
    
    start() {
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
    
    reset() {
        this.cursorPosition = 50;
        this.hitsLeft = 0;
        this.hitsRight = 0;
        this.history = [];
        this.updateDisplay();
        this.updateHistory();
    }
    
    randomPrediction() {
        // Simulate a random classification
        this.currentPrediction = Math.random() > 0.5 ? 1 : 0;
        this.confidence = 0.6 + Math.random() * 0.3; // 60-90% confidence
        this.updateDisplay();
        this.moveCursor();
        this.addToHistory();
    }
    
    simulate() {
        // Simulate motor imagery patterns
        // In real system, this would be actual EEG processing
        
        // Random walk for predictions with some persistence
        if (Math.random() > 0.7) {
            this.currentPrediction = Math.random() > 0.5 ? 1 : 0;
        }
        
        // Confidence varies with signal quality
        this.confidence = 0.5 + Math.random() * 0.4;
        
        // Generate fake EEG data
        this.generateEEGData();
        
        // Update display
        this.updateDisplay();
        this.drawEEG();
        this.moveCursor();
        
        // Occasionally add to history
        if (Math.random() > 0.9) {
            this.addToHistory();
        }
    }
    
    generateEEGData() {
        const time = Date.now() / 1000;
        
        // Simulate mu (8-12 Hz) and beta (13-30 Hz) activity
        const muFreq = 10;
        const betaFreq = 20;
        
        // C3: Higher when imagining left hand
        const c3Amplitude = this.currentPrediction === 0 ? 0.3 : 0.8;
        const c3 = c3Amplitude * Math.sin(2 * Math.PI * muFreq * time) +
                   0.2 * Math.sin(2 * Math.PI * betaFreq * time) +
                   (Math.random() - 0.5) * 0.1;
        
        // C4: Higher when imagining right hand
        const c4Amplitude = this.currentPrediction === 1 ? 0.3 : 0.8;
        const c4 = c4Amplitude * Math.sin(2 * Math.PI * muFreq * time + Math.PI/4) +
                   0.2 * Math.sin(2 * Math.PI * betaFreq * time) +
                   (Math.random() - 0.5) * 0.1;
        
        // Cz: Moderate activity
        const cz = 0.5 * Math.sin(2 * Math.PI * muFreq * time + Math.PI/2) +
                   0.15 * Math.sin(2 * Math.PI * betaFreq * time) +
                   (Math.random() - 0.5) * 0.1;
        
        this.eegData.c3.push(c3);
        this.eegData.c4.push(c4);
        this.eegData.cz.push(cz);
        
        // Keep only last 100 points
        const maxPoints = 100;
        if (this.eegData.c3.length > maxPoints) {
            this.eegData.c3.shift();
            this.eegData.c4.shift();
            this.eegData.cz.shift();
        }
    }
    
    drawEEG() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const channelHeight = height / 3;
        
        // Clear canvas
        this.ctx.fillStyle = '#0F172A';
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, height);
            this.ctx.stroke();
        }
        for (let i = 0; i < height; i += channelHeight) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(width, i);
            this.ctx.stroke();
        }
        
        // Draw signals
        this.drawChannel(this.eegData.c3, 0, channelHeight, '#F97316'); // C3 - Orange
        this.drawChannel(this.eegData.c4, channelHeight, channelHeight, '#06B6D4'); // C4 - Cyan
        this.drawChannel(this.eegData.cz, channelHeight * 2, channelHeight, '#10B981'); // Cz - Green
    }
    
    drawChannel(data, offsetY, height, color) {
        if (data.length < 2) return;
        
        const width = this.canvas.width;
        const centerY = offsetY + height / 2;
        const scale = height * 0.4;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const x = (i / data.length) * width;
            const y = centerY - data[i] * scale;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    updateDisplay() {
        // Update prediction display
        const predictionResult = document.getElementById('predictionResult');
        const icon = this.currentPrediction === 0 ? '👈' : '👉';
        const text = this.currentPrediction === 0 ? 'LEFT HAND' : 'RIGHT HAND';
        
        predictionResult.innerHTML = `
            <span class="prediction-icon">${icon}</span>
            <span class="prediction-text">${text}</span>
        `;
        
        // Update confidence
        const confidencePercent = (this.confidence * 100).toFixed(0);
        document.getElementById('confidence').innerHTML = `
            Confidence: <span class="confidence-value">${confidencePercent}%</span>
        `;
        
        // Update probability bars
        const leftProb = this.currentPrediction === 0 ? this.confidence : (1 - this.confidence);
        const rightProb = 1 - leftProb;
        
        document.getElementById('leftProb').style.width = `${leftProb * 100}%`;
        document.getElementById('rightProb').style.width = `${rightProb * 100}%`;
        document.getElementById('leftValue').textContent = `${(leftProb * 100).toFixed(0)}%`;
        document.getElementById('rightValue').textContent = `${(rightProb * 100).toFixed(0)}%`;
        
        // Update latency (simulated)
        const latency = 200 + Math.random() * 100;
        document.getElementById('latency').textContent = `${latency.toFixed(0)}ms`;
        
        // Update cursor position text
        const cursor = document.getElementById('cursor');
        const position = this.cursorPosition < 40 ? 'Left Zone' :
                        this.cursorPosition > 60 ? 'Right Zone' : 'Center';
        document.getElementById('cursorPos').textContent = position;
        
        // Update hit counters
        document.getElementById('hitsLeft').textContent = this.hitsLeft;
        document.getElementById('hitsRight').textContent = this.hitsRight;
    }
    
    moveCursor() {
        // Move cursor based on prediction
        const moveAmount = this.confidence * 5;
        
        if (this.currentPrediction === 0) {
            // Move left
            this.cursorPosition = Math.max(0, this.cursorPosition - moveAmount);
        } else {
            // Move right
            this.cursorPosition = Math.min(100, this.cursorPosition + moveAmount);
        }
        
        // Update cursor position
        const cursor = document.getElementById('cursor');
        cursor.style.left = `${this.cursorPosition}%`;
        
        // Check if hit target zones
        if (this.cursorPosition < 15) {
            this.hitsLeft++;
            this.flashTarget('left');
        } else if (this.cursorPosition > 85) {
            this.hitsRight++;
            this.flashTarget('right');
        }
    }
    
    flashTarget(side) {
        const zone = side === 'left' ? 
            document.querySelector('.left-zone') :
            document.querySelector('.right-zone');
        
        zone.classList.add('hit');
        setTimeout(() => zone.classList.remove('hit'), 500);
    }
    
    addToHistory() {
        const time = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const classification = this.currentPrediction === 0 ? 'Left Hand' : 'Right Hand';
        const confidence = (this.confidence * 100).toFixed(0);
        const correct = Math.random() > 0.3; // 70% correct for demo
        
        const historyItem = {
            time,
            classification,
            confidence,
            correct
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.updateHistory();
    }
    
    updateHistory() {
        const historyLog = document.getElementById('historyLog');
        historyLog.innerHTML = '';
        
        this.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const classColor = item.classification.includes('Left') ? 'left' : 'right';
            const resultIcon = item.correct ? '✓' : '✗';
            const resultClass = item.correct ? 'correct' : 'incorrect';
            
            div.innerHTML = `
                <span class="history-time">${item.time}</span>
                <span class="history-class ${classColor}">${item.classification}</span>
                <span class="history-conf">${item.confidence}%</span>
                <span class="history-result ${resultClass}">${resultIcon}</span>
            `;
            
            historyLog.appendChild(div);
        });
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.simulate();
        
        setTimeout(() => {
            requestAnimationFrame(() => this.animate());
        }, 100); // Update every 100ms
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    const demo = new BCIDemo();
    
    // Auto-start demo after 2 seconds
    setTimeout(() => {
        demo.start();
    }, 2000);
});