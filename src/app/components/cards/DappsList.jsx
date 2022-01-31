import { Component } from 'react';
import { connect } from 'react-redux';
import Icon from '../elements/Icon';

class DappsList extends Component {
    render() {
        const { dapps } = this.props; // redux
        const categories = dapps.toJS();

        const dataToRender = Object.entries(categories).map(
            ([categoryLabel, categoryValue], index) => {
                return (
                    <div className="categories" key={index}>
                        <br />
                        <br />
                        <h3 className="panel">{categoryLabel}</h3>
                        <br />
                        <div className="row">
                            {categoryValue.map((item, index2) => {
                                return (
                                    <div className="small-12 large-4 column">
                                        <div
                                            className="single-category"
                                            key={index2 + item.title}
                                        >
                                            <Icon name="blurt" size="5x" />
                                            <h4>{item.title}</h4>
                                            <br />
                                            <h5>
                                                <a
                                                    href={
                                                        'https://blurt.blog/' +
                                                        item.user
                                                    }
                                                >
                                                    By {item.user}
                                                </a>
                                            </h5>
                                            <br />
                                            <br />
                                            <a
                                                href={item.url}
                                                className="button round"
                                            >
                                                Visit
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }
        );

        return <div>{dataToRender}</div>;
    }
}

export default connect((state) => {
    const dapps =
        state.global.getIn(['dapps']) == undefined
            ? undefined
            : state.global.getIn(['dapps']);
    return {
        dapps,
    };
})(DappsList);
