<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    
    export let onStartTutorial: () => void;
    export let onSkipToApp: () => void;
</script>

<div class="guide-overlay">
    <div class="guide-container">
        <div class="guide-cards">
            <!-- First Time User Card -->
            <div class="guide-card">
                <div class="card-icon">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <!-- Simple person with question mark illustration -->
                        <circle cx="50" cy="30" r="15" fill="#FFE4B5"/>
                        <path d="M 35 50 Q 35 45 50 45 Q 65 45 65 50 L 65 75 Q 65 80 50 80 Q 35 80 35 75 Z" fill="#B8A7D6"/>
                        <circle cx="60" cy="25" r="18" fill="#5B4B8A" opacity="0.3"/>
                        <text x="60" y="32" font-size="20" fill="white" font-weight="bold">?</text>
                    </svg>
                </div>
                <h2>First Time Using Our App</h2>
                <p>Go through our short tutorial to get you started</p>
                <button class="guide-button primary" on:click={onStartTutorial}>
                    Tutorial
                </button>
            </div>

            <!-- Returning User Card -->
            <div class="guide-card">
                <div class="card-icon">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <!-- Simple person with checkmark illustration -->
                        <circle cx="50" cy="30" r="15" fill="#FFE4B5"/>
                        <path d="M 35 50 Q 35 45 50 45 Q 65 45 65 50 L 65 75 Q 65 80 50 80 Q 35 80 35 75 Z" fill="#B8A7D6"/>
                        <circle cx="65" cy="28" r="18" fill="#6B8E23" opacity="0.8"/>
                        <path d="M 58 28 L 62 33 L 72 23" stroke="white" stroke-width="3" fill="none"/>
                    </svg>
                </div>
                <h2>I Know How The App Work</h2>
                <p>Already know how our app works? feel free to give our app a try</p>
                <button class="guide-button secondary" on:click={onSkipToApp}>
                    Go to app
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .guide-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #d9cce7 0%, #a987c6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 2rem;
    }

    .guide-container {
        max-width: 1000px;
        width: 100%;
    }

    .guide-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        padding: 1rem;
    }

    .guide-card {
        background: linear-gradient(135deg, #f0e6f6 0%, #e8d9f0 100%);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .guide-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }

    .card-icon {
        width: 120px;
        height: 120px;
        margin-bottom: 1.5rem;
    }

    .card-icon svg {
        width: 100%;
        height: 100%;
    }

    h2 {
        color: #5B4B8A;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        line-height: 1.3;
        font-family: Arial, Helvetica, sans-serif;
    }

    p {
        color: #6B5B8A;
        font-size: 1rem;
        margin: 0 0 2rem 0;
        line-height: 1.5;
        font-family: Arial, Helvetica, sans-serif;
    }

    .guide-button {
        padding: 0.875rem 2.5rem;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        max-width: 200px;
        font-family: Arial, Helvetica, sans-serif;
    }

    .guide-button.primary {
        background: linear-gradient(135deg, #7F6399 0%, #5B4B8A 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(95, 75, 139, 0.3);
    }

    .guide-button.primary:hover {
        background: linear-gradient(135deg, #8F73A9 0%, #6B5B9A 100%);
        box-shadow: 0 6px 16px rgba(95, 75, 139, 0.4);
        transform: translateY(-2px);
    }

    .guide-button.secondary {
        background: white;
        color: #7F6399;
        border: 2px solid #7F6399;
        box-shadow: 0 4px 12px rgba(127, 99, 153, 0.2);
    }

    .guide-button.secondary:hover {
        background: #7F6399;
        color: white;
        box-shadow: 0 6px 16px rgba(127, 99, 153, 0.3);
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        .guide-cards {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        h2 {
            font-size: 1.25rem;
        }

        p {
            font-size: 0.9rem;
        }
    }
</style>
