import { Component } from 'react';

export default class UserAvatar extends Component {
    componentDidMount() {
        // to load google model viewer script
        const script = document.createElement('script');
        script.src =
            'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
        script.type = 'module';
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        if (typeof window === 'undefined') return <div />;

        const { avatarUrl } = this.props;
        if (!avatarUrl) return <div />;

        return (
            <div className="row">
                <div className="column">
                    <model-viewer
                        className="Model-Viewer"
                        src={avatarUrl}
                        alt="Ready Player me avatar"
                        camera-controls
                        auto-rotate
                        poster="/images/loading-animation.webp"
                    />
                </div>
            </div>
        );
    }
}
