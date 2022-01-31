const SidebarStats = ({
    operationFlatFee,
    bandwidthKbytesFee,
    pricePerBlurt,
}) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3" style={{ textAlign: 'center' }}>
                Transaction Fees
            </h3>
        </div>
        <div
            className="c-sidebar__content"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                gap: '1.2em',
            }}
        >
            <ul className="c-sidebar__list-small">
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-evenly',
                            gap: '.2em',
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            Operation Flat Fee
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            {operationFlatFee} BLURT
                        </div>
                    </div>
                </li>
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-evenly',
                            gap: '.2em',
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            Bandwidth Fee
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            {bandwidthKbytesFee} BLURT per kilobyte
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div className="c-sidebar__header" style={{ paddingTop: '1.5em' }}>
            <h3 className="c-sidebar__h3" style={{ textAlign: 'center' }}>
                BLURT Price (USD)
            </h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list-small">
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        1 BLURT = ${pricePerBlurt}
                    </div>
                </li>
            </ul>
        </div>
    </div>
);

export default SidebarStats;
