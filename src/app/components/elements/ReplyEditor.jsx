/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-default-props */
/* eslint-disable react/static-property-placement */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/tabindex-no-positive */
/* eslint-disable react/no-string-refs */
/* eslint-disable no-useless-escape */
/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-parens */
import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import reactForm from 'app/utils/ReactForm';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import CategorySelector, {
    validateCategory,
} from 'app/components/cards/CategorySelector';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip';
import sanitizeConfig, { allowedTags } from 'app/utils/SanitizeConfig';
import sanitize from 'sanitize-html';
import HtmlReady from 'shared/HtmlReady';
import { connect } from 'react-redux';
import { fromJS, Set } from 'immutable';
import { Remarkable } from 'remarkable';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';
import 'emoji-mart/css/emoji-mart.css';
import { Picker, Emoji } from 'emoji-mart';

// import dynamic from "next/dynamic";

// import tinymce from 'tinymce/tinymce';
// import "tinymce";

// import 'tinymce/icons/default';
// import "tinymce/themes/silver";
// import 'tinymce/plugins/emoticons';
// import 'tinymce/plugins/emoticons/js/emojis';
// import 'tinymce/plugins/table';
// import 'tinymce/plugins/help';
// import 'tinymce/plugins/lists';
// import 'tinymce/plugins/nonbreaking';
// import 'tinymce/plugins/quickbars';
// import 'tinymce/plugins/preview';
// import 'tinymce/plugins/imagetools';
// import 'tinymce/plugins/codesample';
// import 'tinymce/plugins/code';
// import 'tinymce/plugins/hr';
// import 'tinymce/plugins/anchor';
// import 'tinymce/plugins/image';
// import 'tinymce/plugins/link';
// import 'tinymce/plugins/wordcount';
// import 'tinymce/skins/ui/oxide/skin.min.css';

// import { Editor } from '@tinymce/tinymce-react';
// import Prism from "prismjs";

const MAX_FILE_TO_UPLOAD = 10;
const imagesToUpload = [];

const remarkable = new Remarkable({ html: true, breaks: true });

const RTE_DEFAULT = false;

class ReplyEditor extends Component {
    static defaultProps = {
        // eslint-disable-next-line react/default-props-match-prop-types
        isStory: false,
        author: '',
        parent_author: '',
        parent_permlink: '',
        type: 'submit_comment',
    };

    static propTypes = {
        // html component attributes
        formId: PropTypes.string.isRequired, // unique form id for each editor
        type: PropTypes.oneOf(['submit_story', 'submit_comment', 'edit']),
        successCallback: PropTypes.func, // indicator that the editor is done and can be hidden
        onCancel: PropTypes.func, // hide editor when cancel button clicked
        author: PropTypes.string, // empty or string for top-level post
        permlink: PropTypes.string, // new or existing category (default calculated from title)
        parent_author: PropTypes.string, // empty or string for top-level post
        parent_permlink: PropTypes.string, // new or existing category
        // eslint-disable-next-line react/forbid-prop-types
        jsonMetadata: PropTypes.object, // An existing comment has its own meta data
        category: PropTypes.string, // initial value
        title: PropTypes.string, // initial value
        body: PropTypes.string, // initial value
        richTextEditor: PropTypes.func,
        defaultPayoutType: PropTypes.string,
        payoutType: PropTypes.string,
        summary: PropTypes.string,
    };

    constructor(props) {
        super();
        this.state = { progress: {} };
        this.initForm(props);
        this.postRef = React.createRef();
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.isStory) this.refs.titleRef.focus();
            else if (this.postRef.current) this.postRef.current.focus();
            else if (this.refs.rte) this.refs.rte._focus();
        }, 300);

        const { formId } = this.props;

        if (process.env.BROWSER) {
            // Check for rte editor preference
            let rte = this.props.isStory
                && JSON.parse(
                    localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT
                );
            let raw = null;

            // Process initial body value (if this is an edit)
            const { body } = this.state;
            if (body.value) {
                raw = body.value;
            }

            // Check for draft data
            let draft = localStorage.getItem('replyEditorData-' + formId);
            if (draft) {
                draft = JSON.parse(draft);
                const { category, title, summary } = this.state;
                if (category) category.props.onChange(draft.category);
                if (title) title.props.onChange(draft.title);
                if (summary) summary.props.onChange(draft.summary);
                if (draft.payoutType) this.props.setPayoutType(formId, draft.payoutType);
                if (draft.beneficiaries) this.props.setBeneficiaries(formId, draft.beneficiaries);
                raw = draft.body;
            }

            // If we have an initial body, check if it's html or markdown
            if (raw) {
                rte = isHtmlTest(raw);
            }

            // console.log("initial reply body:", raw || '(empty)')
            body.props.onChange(raw);
            this.setState({
                rte,
                rte_value: rte
                    ? stateFromHtml(this.props.richTextEditor, raw)
                    : null,
            });
        }

        //        add tinymce
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.10.2/tinymce.min.js';
        script.type = 'module';
        script.async = true;
        document.head.appendChild(script);
        // if(typeof window !== "undefined") {
        //     require('tinymce/tinymce');
        //     require('tinymce/skins/ui/oxide/skin.min.css');
        //     require('tinymce/icons/default');
        //     require("tinymce/themes/silver");
        //     require('tinymce/plugins/emoticons');
        //     require('tinymce/plugins/emoticons/js/emojis');
        //     require('tinymce/plugins/table');
        //     require('tinymce/plugins/help');
        //     require('tinymce/plugins/lists');
        //     require('tinymce/plugins/nonbreaking');
        //     require('tinymce/plugins/quickbars');
        //     require('tinymce/plugins/preview');
        //     require('tinymce/plugins/imagetools');
        //     require('tinymce/plugins/codesample');
        //     require('tinymce/plugins/code');
        //     require('tinymce/plugins/hr');
        //     require('tinymce/plugins/anchor');
        //     require('tinymce/plugins/image');
        //     require('tinymce/plugins/link');
        //     require('tinymce/plugins/wordcount');
        // }
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'ReplyEditor');

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (process.env.BROWSER) {
            const ts = this.state;
            const ns = nextState;
            const tp = this.props;
            const np = nextProps;

            // Save curent draft to localStorage
            if (
                ts.body.value !== ns.body.value
                || (ns.summary && ts.summary.value !== ns.summary.value)
                || (ns.category && ts.category.value !== ns.category.value)
                || (ns.title && ts.title.value !== ns.title.value)
                || np.payoutType !== tp.payoutType
                || np.beneficiaries !== tp.beneficiaries
            ) {
                // also prevents saving after parent deletes this information
                const { formId, payoutType, beneficiaries } = np;
                const {
                    category, title, body, summary
                } = ns;
                const data = {
                    formId,
                    title: title ? title.value : undefined,
                    category: category ? category.value : undefined,
                    body: body.value,
                    payoutType,
                    beneficiaries,
                    summary: summary ? summary.value : undefined,
                };

                saveEditorTimeout = setTimeout(() => {
                    // console.log('save formId', formId, body.value)
                    localStorage.setItem(
                        'replyEditorData-' + formId,
                        JSON.stringify(data, null, 0)
                    );
                    this.showDraftSaved();
                }, 500);
                clearTimeout(saveEditorTimeout);
            }
        }
    }

    // getSnapshotBeforeUpdate(prevProps, prevState) {
    //     // Are we adding new items to the list?
    //     // Capture the scroll position so we can adjust scroll later.
    //     if (prevProps.list.length < this.props.list.length) {
    //       return (
    //         this.listRef.scrollHeight - this.listRef.scrollTop
    //       );
    //     }
    //     return null;
    //   }

    //   componentDidUpdate(prevProps, prevState, snapshot) {
    //     // If we have a snapshot value, we've just added new items.
    //     // Adjust scroll so these new items don't push the old ones out of view.
    //     // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    //     if (snapshot !== null) {
    //       this.listRef.scrollTop =
    //         this.listRef.scrollHeight - snapshot;
    //     }
    //   }

    commentEditorRef = React.createRef();

    onCancel = (e) => {
        if (e) e.preventDefault();
        const { formId, onCancel, defaultPayoutType } = this.props;
        const { replyForm, body } = this.state;
        if (
            !body.value
            // eslint-disable-next-line no-alert
            || confirm(tt('reply_editor.are_you_sure_you_want_to_clear_this_form'))
        ) {
            replyForm.resetForm();
            this.setState({
                rte_value: stateFromHtml(this.props.richTextEditor),
            });
            this.setState({ progress: {} });
            this.props.setPayoutType(formId, defaultPayoutType);
            this.props.setBeneficiaries(formId, []);
            if (onCancel) onCancel(e);
        }
    };

    // As rte_editor is updated, keep the (invisible) 'body' field in sync.
    onChange = (rte_value) => {
        this.setState({ rte_value });
        const html = stateToHtml(rte_value);
        const { body } = this.state;
        if (body.value !== html) body.props.onChange(html);
    };

    onChange2 = (rte_value) => {
        console.log('Rte value', rte_value);
        this.setState({ rte_value });
        const html = stateToHtml(rte_value);
        const { body } = this.state;
        if (body.value !== html) body.props.onChange(html);
    };

    onDrop = (acceptedFiles, rejectedFiles) => {
        if (!acceptedFiles.length) {
            if (rejectedFiles.length) {
                this.displayErrorMessage('Please insert only image files.');
                console.log('onDrop Rejected files: ', rejectedFiles);
            }
            return;
        }
        if (acceptedFiles.length > MAX_FILE_TO_UPLOAD) {
            this.displayErrorMessage(
                `Please upload up to maximum ${MAX_FILE_TO_UPLOAD} images.`
            );
            console.log('onDrop too many files to upload');
            return;
        }

        for (let fi = 0; fi < acceptedFiles.length; fi += 1) {
            const acceptedFile = acceptedFiles[fi];
            const imageToUpload = {
                file: acceptedFile,
                temporaryTag: '',
            };
            imagesToUpload.push(imageToUpload);
        }

        this.insertPlaceHolders();
        this.uploadNextImage();
    };

    // fileDropzone = React.createRef();

    // onOpenClick = () => {
    //     console.log('Open click called');
    //     if(this.fileDropzone.current) {
    //         console.log('Click works');
    //         this.fileDropzone.current.open();
    //     }
    //     // this.dropzone.open();
    // };

    onPasteCapture = (e) => {
        try {
            if (e.clipboardData) {
                e.clipboardData.items.forEach(item => {
                    if (item.kind === 'file' && /^image\//.test(item.type)) {
                        const blob = item.getAsFile();
                        imagesToUpload.push({
                            file: blob,
                            temporaryTag: '',
                        });
                    }
                });
                this.insertPlaceHolders();
                this.uploadNextImage();
            } else {
                // http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
                // contenteditable element that catches all pasted data
                this.setState({ noClipboardData: true });
            }
        } catch (error) {
            console.error('Error analyzing clipboard event', error);
        }
    };

    onSummaryChange = (e) => {
        const { value } = e.target;
        // TODO block links in title (they do not make good permlinks)
        const hasMarkdown = /(?:\*[\w\s]*\*|\#[\w\s]*\#|_[\w\s]*_|~[\w\s]*~|\]\s*\(|\]\s*\[)/.test(
            value
        );
        this.setState({
            summaryWarn: hasMarkdown
                ? tt('reply_editor.markdown_not_supported')
                : '',
        });
        const { summary } = this.state;
        summary.props.onChange(e);
    };

    onTitleChange = (e) => {
        const { value } = e.target;
        // TODO block links in title (they do not make good permlinks)
        const hasMarkdown = /(?:\*[\w\s]*\*|\#[\w\s]*\#|_[\w\s]*_|~[\w\s]*~|\]\s*\(|\]\s*\[)/.test(
            value
        );
        this.setState({
            titleWarn: hasMarkdown
                ? tt('reply_editor.markdown_not_supported')
                : '',
        });
        const { title } = this.state;
        title.props.onChange(e);
    };

    displayErrorMessage = (message) => {
        this.setState({
            progress: { error: message },
        });

        setTimeout(() => {
            this.setState({ progress: {} });
        }, 6000); // clear message
    };

    initForm(props) {
        const { isStory, type, fields } = props;
        const isEdit = type === 'edit';
        const maxKb = isStory ? 65 : 16;
        const markdownRegex = /(?:\*[\w\s]*\*|#[\w\s]*#|_[\w\s]*_|~[\w\s]*~|]\s*\(|]\s*\[)/;
        const htmlTagRegex = /<\/?[\w\s="/.':;#-/?]+>/gi;
        reactForm({
            fields,
            instance: this,
            name: 'replyForm',
            initialValues: props.initialValues,
            validation: (values) => ({
                title:
                    isStory
                    && (!values.title || values.title.trim() === ''
                        ? tt('g.required')
                        : values.title.length > 255
                            ? tt('reply_editor.shorten_title')
                            : null),
                category: isStory && validateCategory(values.category, !isEdit),
                body: !values.body
                    ? tt('g.required')
                    : values.body.length > maxKb * 1024
                        ? tt('reply_editor.exceeds_maximum_length', { maxKb })
                        : null,
                summary:
                    isStory
                    && (values.summary.length > 140
                        ? tt('reply_editor.shorten_summary')
                        : markdownRegex.test(values.summary)
                            ? tt('reply_editor.markdown_not_supported')
                            : htmlTagRegex.test(values.summary)
                                ? tt('reply_editor.html_not_supported')
                                : null),
            }),
        });
    }

    insertPlaceHolders = () => {
        let { imagesUploadCount } = this.state;
        const { body } = this.state;
        const { selectionStart } = this.postRef.current;
        let placeholder = '';

        for (let ii = 0; ii < imagesToUpload.length; ii += 1) {
            const imageToUpload = imagesToUpload[ii];

            if (imageToUpload.temporaryTag === '') {
                imagesUploadCount++;
                imageToUpload.temporaryTag = `![Uploading image #${imagesUploadCount}...]()`;
                placeholder += `\n${imageToUpload.temporaryTag}\n`;
            }
        }
        this.setState({ imagesUploadCount });

        // Insert the temporary tag where the cursor currently is
        body.props.onChange(
            body.value.substring(0, selectionStart)
            + placeholder
            + body.value.substring(selectionStart, body.value.length)
        );
    };

    showAdvancedSettings = (e) => {
        e.preventDefault();
        this.props.setPayoutType(this.props.formId, this.props.payoutType);
        this.props.showAdvancedSettings(this.props.formId);
    };

    showDraftSaved() {
        try {
            // this.refs = React.createRef();
            const { draft } = this.refs;
            draft.className = 'ReplyEditor__draft';
            // eslint-disable-next-line no-void
            void draft.offsetWidth; // reset animation
            draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved';
        } catch (err) {
            // do nothing
        }
    }

    toggleRte = (e) => {
        e.preventDefault();
        const state = { rte: !this.state.rte };
        if (state.rte) {
            const { body } = this.state;
            state.rte_value = isHtmlTest(body.value)
                ? stateFromHtml(this.props.richTextEditor, body.value)
                : stateFromMarkdown(this.props.richTextEditor, body.value);
        }
        this.setState(state);
        localStorage.setItem('replyEditorData-rte', !this.state.rte);
    };

    upload = (image) => {
        const { uploadImage } = this.props;
        this.setState({
            progress: { message: tt('reply_editor.uploading') },
        });
        uploadImage(image.file, (progress) => {
            const { body } = this.state;
            if (progress.url) {
                this.setState({ progress: {} });
                const { url } = progress;
                const imageMd = `![${image.file.name}](${url})`;
                // const { selectionStart, selectionEnd } = this.postRef.current;
                body.props.onChange(
                    body.value.replace(image.temporaryTag, imageMd)
                );
                this.uploadNextImage();
            } else if (Object.prototype.hasOwnProperty.call(progress, 'error')) {
                this.displayErrorMessage(progress.error);
                const imageMd = `![${image.file.name}](UPLOAD FAILED)`;
                // Remove temporary image MD tag
                body.props.onChange(
                    body.value.replace(image.temporaryTag, imageMd)
                );
            } else {
                this.setState({ progress });
            }
        });
    };

    uploadNextImage = () => {
        if (imagesToUpload.length > 0) {
            const nextImage = imagesToUpload.pop();
            this.upload(nextImage);
        }
    };

    addEmoji = (data) => {
        this.setState({ showEmojiPicker: false });

        const { body } = this.state;
        const { selectionStart } = this.postRef.current;
        const nativeEmoji = data.native;

        // Insert the temporary tag where the cursor currently is
        body.props.onChange(
            body.value.substring(0, selectionStart) +
            nativeEmoji +
            body.value.substring(selectionStart, body.value.length)
        );
    };

    toggleEmojiPicker = () => {
        const { showEmojiPicker } = this.state;
        this.setState({ showEmojiPicker: !showEmojiPicker });
    };

    render() {
        const originalPost = {
            category: this.props.category,
            body: this.props.body,
        };
        const { onCancel, onTitleChange, onSummaryChange } = this;
        let { summary } = this.state;
        const { title, category, body } = this.state;

        const {
            reply,
            username,
            isStory,
            formId,
            noImage,
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            jsonMetadata,
            state,
            successCallback,
            defaultPayoutType,
            payoutType,
            tags,
            beneficiaries,
        } = this.props;
        const { submitting, valid, handleSubmit } = this.state.replyForm;
        const {
            postError, titleWarn, rte, summaryWarn
        } = this.state;
        const { progress, noClipboardData } = this.state;
        const disabled = submitting || !valid;
        const loading = submitting || this.state.loading;

        const errorCallback = (estr) => {
            this.setState({ postError: estr, loading: false });
        };
        const successCallbackWrapper = (...args) => {
            this.props.setPayoutType(formId, defaultPayoutType);
            this.props.setBeneficiaries(formId, []);

            // clear draft
            const { replyForm } = this.state;
            localStorage.removeItem('replyEditorData-' + formId);
            replyForm.resetForm();
            const bodyUpdate = { ...this.state.body };
            bodyUpdate.value = '';
            this.setState({
                body: bodyUpdate,
                title: '',
                category: '',
                loading: false,
                summary: '',
            });
            if (successCallback) successCallback(args);
        };
        const isEdit = type === 'edit';
        const isHtml = rte || isHtmlTest(body.value);
        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            state,
            originalPost,
            isHtml,
            isStory,
            jsonMetadata,
            payoutType,
            beneficiaries,
            successCallback: successCallbackWrapper,
            errorCallback,
        };
        const postLabel = username ? (
            <Tooltip t={tt('g.post_as_user', { username })}>
                {tt('g.post')}
            </Tooltip>
        ) : (
            tt('g.post')
        );
        const hasTitleError = title && title.touched && title.error;
        let titleError = null;
        // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
        if (
            (hasTitleError
                && (title.error !== tt('g.required') || body.value !== ''))
            || titleWarn
        ) {
            titleError = (
                <div className={hasTitleError ? 'error' : 'warning'}>
                    {hasTitleError ? title.error : titleWarn}
                    &nbsp;
                </div>
            );
        }

        const hasSummaryError = summary && summary.touched && summary.error;
        let summaryError = null;
        // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
        if (
            (hasSummaryError
                && (summary.error !== tt('g.required') || body.value !== ''))
            || summaryWarn
        ) {
            summaryError = (
                <div className={hasSummaryError ? 'error' : 'warning'}>
                    {hasSummaryError ? summary.error : summaryWarn}
                    &nbsp;
                </div>
            );
        }

        // TODO: remove all references to these vframe classes. Removed from css and no longer needed.
        const vframe_class = isStory ? 'vframe' : '';
        const vframe_section_class = isStory ? 'vframe__section' : '';
        const vframe_section_shrink_class = isStory
            ? 'vframe__section--shrink'
            : '';
        const RichTextEditor = this.props.richTextEditor;

        // if(typeof window !== "undefined") {
        //     const TinyMceEditor = require('@tinymce/tinymce-react');
        // }

        // Cover Image Selection Code
        let selectedCoverImage = '';
        if (jsonMetadata && jsonMetadata.image) {
            const jsonMetadataImages = jsonMetadata.image;
            if (jsonMetadataImages && jsonMetadataImages.length > 0) {
                // eslint-disable-next-line prefer-destructuring
                selectedCoverImage = jsonMetadataImages[0];
            }
        }

        if (!summary && jsonMetadata && jsonMetadata.description) {
            summary = jsonMetadata.description;
        }

        const onSelectCoverImage = (event) => {
            const { target } = event;

            const postImages = document.getElementsByClassName(
                'ReplyEditor__options__image_selector__image_container'
            );
            for (let pi = 0; pi < postImages.length; pi += 1) {
                const postImage = postImages[pi];
                postImage.classList.remove('selected');
            }

            target.classList.add('selected');
            selectedCoverImage = target.style.backgroundImage
                .slice(4, -1)
                .replace(/"/g, '');
        };

        let rtags;
        {
            const html = isHtml ? body : remarkable.render(body.value);

            rtags = HtmlReady(html, { mutate: false });
        }

        const fileDropzone = React.createRef();

        const onOpenClick = () => {
            if (fileDropzone.current) {
                console.log('Click works');
                fileDropzone.current.open();
            }
        };

        return (
            <div className="ReplyEditor row">
                <div className="column small-12">
                    <div
                        ref="draft"
                        className="ReplyEditor__draft ReplyEditor__draft-hide"
                    >
                        {tt('reply_editor.draft_saved')}
                    </div>
                    <form
                        className={vframe_class}
                        onSubmit={handleSubmit(({ data }) => {
                            const startLoadingIndicator = () => this.setState({
                                loading: true,
                                postError: undefined,
                            });
                            reply({
                                ...data,
                                ...replyParams,
                                startLoadingIndicator,
                                selectedCoverImage,
                            });
                        })}
                        onChange={() => {
                            this.setState({ postError: null });
                        }}
                    >
                        <div className={vframe_section_shrink_class}>
                            {isStory && (
                                <span>
                                    <input
                                        type="text"
                                        className="ReplyEditor__title"
                                        onChange={onTitleChange}
                                        disabled={loading}
                                        placeholder={tt('reply_editor.title')}
                                        autoComplete="off"
                                        ref="titleRef"
                                        tabIndex={1}
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...title.props}
                                    />
                                    <div
                                        className="float-right secondary"
                                        style={{ marginRight: '1rem' }}
                                    >
                                        {rte && (
                                            <a
                                                href="#"
                                                onClick={this.toggleRte}
                                            >
                                                {body.value
                                                    ? 'Raw HTML'
                                                    : 'Markdown'}
                                            </a>
                                        )}
                                        {!rte && (isHtml || !body.value) && (
                                            <a
                                                href="#"
                                                onClick={this.toggleRte}
                                            >
                                                {tt('reply_editor.editor')}
                                            </a>
                                        )}
                                    </div>
                                    {titleError}
                                </span>
                            )}
                        </div>

                        <div
                            className={
                                'ReplyEditor__body '
                                + (rte
                                    ? `rte ${vframe_section_class}`
                                    : vframe_section_shrink_class)
                            }
                        >
                            {process.env.BROWSER && rte ? (
                                <RichTextEditor
                                    ref="rte"
                                    readOnly={loading}
                                    value={this.state.rte_value}
                                    onChange={this.onChange}
                                    onBlur={body.onBlur}
                                    tabIndex={2}
                                />
                            ) : (
                                <span>
                                    {/* {isStory && ( */}
                                    {/* <span> */}
                                    <textarea
                                        {...body.props}
                                        ref={this.postRef}
                                        onPasteCapture={this.onPasteCapture}
                                        className={
                                            type === 'submit_story'
                                                ? 'upload-enabled'
                                                : ''
                                        }
                                        disabled={loading}
                                        rows={isStory ? 10 : 6}
                                        placeholder={
                                            isStory
                                                ? tt('g.write_your_story')
                                                : tt('g.reply')
                                        }
                                        autoComplete="off"
                                        tabIndex={2}
                                    />
                                    <Dropzone
                                        onDrop={this.onDrop}
                                        className={
                                            type === 'submit_story'
                                                ? 'dropzone'
                                                : 'none'
                                        }
                                        multiple
                                        noClick
                                        noKeyboard
                                        accept="image/*"
                                        ref={fileDropzone}
                                    >
                                        {({ getRootProps, getInputProps, isDragActive }) => {
                                            return (
                                                <div {...getRootProps({ className: 'dropzone' })} className={classnames('dropzone', { 'dropzone--isactive': isDragActive })}>
                                                    <p className="drag-and-drop">
                                                        <input {...getInputProps()} />
                                                        <a type="button" onClick={this.toggleEmojiPicker}>
                                                            <Emoji emoji={{ id: 'smiley', skin: 2 }} size={28} />
                                                        </a>
                                                        &nbsp; | &nbsp;
                                                        {tt(
                                                            'reply_editor.insert_images_by_dragging_dropping'
                                                        )}
                                                        {noClipboardData
                                                            ? ''
                                                            : tt(
                                                                'reply_editor.pasting_from_the_clipboard'
                                                            )}
                                                        {tt('reply_editor.or_by')}
                                                        {' '}
                                                        <a onClick={onOpenClick}>
                                                            {tt('reply_editor.selecting_them')}
                                                        </a>
                                                        .
                                                    </p>
                                                </div>
                                            )
                                        }}
                                    </Dropzone>
                                    {/* </span> */}
                                    {/* )} */}
                                    {progress.message && (
                                        <div className="info">
                                            {progress.message}
                                        </div>
                                    )}
                                    {progress.error && (
                                        <div className="error">
                                            {tt('reply_editor.image_upload')}
                                            {' '}
                                            :
                                            {' '}
                                            {progress.error}
                                        </div>
                                    )}
                                    {/* {!isStory && typeof window !== "undefined" && (
                                        <Editor
                                            ref={this.commentEditorRef}
                                            onBlur={body.onBlur}
                                            onEditorChange={this.onChange2}
                                            // onChange={this.onChange2}
                                            apiKey="vd092f869ur5xpeos999x9befq5jxh5nghgomhiwq83etisx"
                                            value={this.state.rte_value}
                                            init={{
                                                branding: false,
                                                plugins: "emoticons link code image anchor codesample hr imagetools lists table nonbreaking preview quickbars help wordcount",
                                                toolbar: "emoticons | formatgroup paragraphgroup insertgroup | code codesample anchor | media nonbreaking preview help wordcount",
                                                toolbar_location: "bottom",
                                                imagetools_cors_hosts: ['blurt.live', 'blurtblog.tekraze.com', 'blurtlatam.com', 'blurt.blog'],
                                                menubar: false,
                                                toolbar_groups: {
                                                    formatgroup: {
                                                        icon: 'format',
                                                        tooltip: 'Formatting',
                                                        items: 'bold italic underline strikethrough | forecolor backcolor | superscript subscript | removeformat'
                                                    },
                                                    paragraphgroup: {
                                                        icon: 'paragraph',
                                                        tooltip: 'Paragraph format',
                                                        items: 'h1 h2 h3 h4 h5 h6 | bullist numlist | alignleft aligncenter alignright | indent outdent'
                                                    },
                                                    insertgroup: {
                                                        icon: 'plus',
                                                        tooltip: 'Insert',
                                                        items: 'link image emoticons hr'
                                                    }
                                                },
                                                media_live_embeds: true,
                                                media_alt_source: false,
                                                media_poster: false,
                                                quickbars_insert_toolbar: 'quicktable image media codesample',
                                                quickbars_selection_toolbar: 'bold italic underline | h1 h2 h3 | formatselect | bullist numlist | blockquote quicklink',
                                                contextmenu: 'undo redo | inserttable | cell row column deletetable | help',
                                                image_advtab: true
                                            }}
                                            ref={this.commentEditorRef}
                                        />
                                    )} */}
                                </span>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            <div className="error">
                                {body.touched
                                    && body.error
                                    && body.error !== 'Required'
                                    && body.error}
                            </div>
                        </div>

                        <br />
                        <div className={vframe_section_shrink_class}>
                            <div className="text-center">
                                {this.state.showEmojiPicker && (
                                    <Picker onSelect={this.addEmoji} />
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div
                            className={vframe_section_shrink_class}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {isStory && (
                                <span>
                                    <input
                                        {...summary.props}
                                        type="text"
                                        className="ReplyEditor__summary"
                                        onChange={onSummaryChange}
                                        disabled={loading}
                                        placeholder={tt('reply_editor.summary')}
                                        autoComplete="off"
                                        ref="summaryRef"
                                        tabIndex={0}
                                    />
                                </span>
                            )}
                            {summaryError}
                        </div>

                        <div
                            className={vframe_section_shrink_class}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {isStory && (
                                <span>
                                    <CategorySelector
                                        {...category.props}
                                        disabled={loading}
                                        isEdit={isEdit}
                                        tabIndex={3}
                                        trending={tags}
                                    />
                                    <div className="error">
                                        {(category.touched || category.value)
                                            && category.error}
                                        &nbsp;
                                    </div>
                                </span>
                            )}
                        </div>

                        {/* Cover Image */}
                        {isStory && (
                            <div>
                                {Array.from(rtags.images).length > 0 && (
                                    <div className="ReplyEditor__options__cover_image_selector">
                                        <h5>
                                            {tt(
                                                'reply_editor.select_cover_image'
                                            )}
                                            :
                                        </h5>
                                        <div className="ReplyEditor__options__image_selector">
                                            {Array.from(rtags.images).map(
                                                (image) => {
                                                    return (
                                                        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                                                        <div
                                                            key={image}
                                                            className={classnames(
                                                                'ReplyEditor__options__image_selector__image_container',
                                                                {
                                                                    selected:
                                                                        image
                                                                        === selectedCoverImage,
                                                                }
                                                            )}
                                                            style={{
                                                                backgroundImage: `url(${image})`,
                                                            }}
                                                            onClick={
                                                                onSelectCoverImage
                                                            }
                                                        />
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cover Image */}

                        <div className={vframe_section_shrink_class}>
                            {isStory && !isEdit && (
                                <div className="ReplyEditor__options">
                                    <div>
                                        <div>
                                            {tt('g.rewards')}
                                            {': '}
                                            {this.props.payoutType == '0%'
                                                && tt(
                                                    'reply_editor.decline_payout'
                                                )}
                                            {this.props.payoutType == '100%'
                                                && tt('reply_editor.power_up_100')}
                                            {this.props.payoutType == '75%'
                                                && tt(
                                                    'reply_editor.power_up_25_75'
                                                )}
                                        </div>
                                        <div>
                                            {beneficiaries
                                                && beneficiaries.length > 0 && (
                                                    <span>
                                                        {tt('g.beneficiaries')}
                                                        {': '}
                                                        {tt(
                                                            'reply_editor.beneficiaries_set',
                                                            {
                                                                count: beneficiaries.length,
                                                            }
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                        <a
                                            href="#"
                                            onClick={this.showAdvancedSettings}
                                        >
                                            {tt(
                                                'reply_editor.advanced_settings'
                                            )}
                                        </a>
                                        {' '}
                                        <br />
                                        &nbsp;
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {postError && (
                                <div className="error">{postError}</div>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {!loading && (
                                <button
                                    type="submit"
                                    className="button"
                                    disabled={disabled}
                                    tabIndex={4}
                                >
                                    {isEdit
                                        ? tt('reply_editor.update_post')
                                        : postLabel}
                                </button>
                            )}
                            {loading && (
                                <span>
                                    <br />
                                    <LoadingIndicator type="circle" />
                                </span>
                            )}
                            &nbsp;
                            {' '}
                            {!loading && this.props.onCancel && (
                                <button
                                    type="button"
                                    className="secondary hollow button no-border"
                                    tabIndex={5}
                                    onClick={onCancel}
                                >
                                    {tt('g.cancel')}
                                </button>
                            )}
                            {!loading && !this.props.onCancel && (
                                <button
                                    className="button hollow no-border"
                                    tabIndex={5}
                                    disabled={submitting}
                                    onClick={onCancel}
                                >
                                    {tt('g.clear')}
                                </button>
                            )}
                            {!isStory
                                && !isEdit
                                && this.props.payoutType != '100%' && (
                                    <div className="ReplyEditor__options float-right text-right">
                                        {tt('g.rewards')}
                                        {': '}
                                        {this.props.payoutType == '0%'
                                            && tt('reply_editor.decline_payout')}
                                        {'. '}
                                        <a href={'/@' + username + '/settings'}>
                                            Update settings
                                        </a>
                                    </div>
                                )}
                        </div>
                    </form>
                    {!loading && !rte && body.value && (
                        <div
                            className={'Preview ' + vframe_section_shrink_class}
                        >
                            {!isHtml && (
                                <div className="float-right">
                                    <a
                                        target="_blank"
                                        href="https://guides.github.com/features/mastering-markdown/"
                                        rel="noopener noreferrer"
                                    >
                                        {tt(
                                            'reply_editor.markdown_styling_guide'
                                        )}
                                    </a>
                                </div>
                            )}
                            <h6>{tt('g.preview')}</h6>
                            <MarkdownViewer
                                text={body.value}
                                jsonMetadata={jsonMetadata}
                                large={isStory}
                                noImage={noImage}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

let saveEditorTimeout;

// removes <html></html> wrapper if exists
function stripHtmlWrapper(text) {
    const m = text.match(/<html>\n*([\S\s]+?)?\n*<\/html>/m);
    return m && m.length === 2 ? m[1] : text;
}

// See also MarkdownViewer render
const isHtmlTest = (text) => /^<html>/.test(text);

function stateToHtml(state) {
    let html = state.toString('html');
    if (html === '<p></p>') html = '';
    if (html === '<p><br></p>') html = '';
    if (html == '') return '';
    return `<html>\n${html}\n</html>`;
}

function stateFromHtml(RichTextEditor, html = null) {
    if (!RichTextEditor) return null;
    if (html) html = stripHtmlWrapper(html);
    if (html && html.trim() == '') html = null;
    return html
        ? RichTextEditor.createValueFromString(html, 'html')
        : RichTextEditor.createEmptyValue();
}

function stateFromMarkdown(RichTextEditor, markdown) {
    let html;
    if (markdown && markdown.trim() !== '') {
        html = remarkable.render(markdown);
        html = HtmlReady(html).html; // TODO: option to disable youtube conversion, @-links, img proxy
        //html = htmlclean(html) // normalize whitespace
        console.log('markdown converted to:', html);
    }
    return stateFromHtml(RichTextEditor, html);
}

const richTextEditor = process.env.BROWSER
    ? require('react-rte-image').default
    : null;

export default (formId) => connect(
    // mapStateToProps
    (state, ownProps) => {
        const username = state.user.getIn(['current', 'username']);
        const tags = [];
        const fields = ['body'];
        const { type, parent_author, jsonMetadata } = ownProps;
        const isEdit = type === 'edit';
        const isStory = /submit_story/.test(type) || (isEdit && parent_author === '');
        if (isStory) {
            fields.push('title');
            fields.push('category');
            fields.push('summary');
        }

        const { summary } = ownProps;
        let { category, title, body } = ownProps;
        if (/submit_/.test(type)) {
            title = '';
            body = '';
        }
        if (isStory && jsonMetadata && jsonMetadata.tags) {
            category = Set([category, ...jsonMetadata.tags]).join(' ');
        }

        const defaultPayoutType = state.app.getIn(
            [
                'user_preferences',
                isStory ? 'defaultBlogPayout' : 'defaultCommentPayout',
            ],
            '75%'
        );
        let payoutType = state.user.getIn([
            'current',
            'post',
            formId,
            'payoutType',
        ]);
        if (!payoutType) {
            payoutType = defaultPayoutType;
        }
        let beneficiaries = state.user.getIn([
            'current',
            'post',
            formId,
            'beneficiaries',
        ]);
        beneficiaries = beneficiaries ? beneficiaries.toJS() : [];

        const ret = {
            ...ownProps,
            fields,
            isStory,
            username,
            defaultPayoutType,
            payoutType,
            initialValues: {
                title,
                body,
                category,
                summary,
            },
            state,
            formId,
            richTextEditor,
            beneficiaries,
            tags,
        };
        return ret;
    },

    // mapDispatchToProps
    (dispatch) => ({
        uploadImage: (file, progress) => dispatch(userActions.uploadImage({ file, progress })),
        showAdvancedSettings: (formId) => dispatch(userActions.showPostAdvancedSettings({ formId })),
        setPayoutType: (formId, payoutType) => dispatch(
            userActions.set({
                key: ['current', 'post', formId, 'payoutType'],
                value: payoutType,
            })
        ),
        setBeneficiaries: (formId, beneficiaries) => dispatch(
            userActions.set({
                key: ['current', 'post', formId, 'beneficiaries'],
                value: fromJS(beneficiaries),
            })
        ),
        reply: ({
            category,
            title,
            summary,
            body,
            author,
            permlink,
            parent_author,
            parent_permlink,
            isHtml,
            isStory,
            type,
            originalPost,
            payoutType,
            state,
            jsonMetadata,
            beneficiaries = [],
            successCallback,
            errorCallback,
            startLoadingIndicator,
            selectedCoverImage,
        }) => {
            // const post = state.global.getIn(['content', author + '/' + permlink])
            const username = state.user.getIn(['current', 'username']);

            const isEdit = type === 'edit';
            const isNew = /^submit_/.test(type);

            // Wire up the current and parent props for either an Edit or a Submit (new post)
            //'submit_story', 'submit_comment', 'edit'
            const linkProps = isNew
                ? {
                    // submit new
                    parent_author: author,
                    parent_permlink: permlink,
                    author: username,
                    // permlink,  assigned in TransactionSaga
                }
                : // edit existing
                isEdit
                    ? {
                        author, permlink, parent_author, parent_permlink
                    }
                    : null;

            if (!linkProps) throw new Error('Unknown type: ' + type);

            // If this is an HTML post, it MUST begin and end with the tag
            if (isHtml && !body.match(/^<html>[\s\S]*<\/html>$/)) {
                errorCallback(
                    'HTML posts must begin with <html> and end with </html>'
                );
                return;
            }

            // For footer message
            if (!isEdit) {
                const messageMarkdown = "<br /> <hr /> <center><sub>Posted from [https://blurtlatam.com](https://blurtlatam.com/" + parent_permlink + "/@" + author + "/" + permlink + ")</sub></center>";
                const messageHTML = '<br /> <hr /> <center><sub>Posted from <a href="https://blurtlatam.com/' + parent_permlink + '/@' + author + '/' + permlink + '">https://blurtlatam.com</a></sub></center>';
                // if (!isStory) {
                //     body += ` ` + messageHTML;
                //     isHtml = true;
                // } else
                if (!isHtmlTest(body)) {
                    body += ` ` + messageHTML;
                } else if (isHtmlTest(body)) {
                    let htmlFromBody = body;
                    if (htmlFromBody) htmlFromBody = stripHtmlWrapper(htmlFromBody);
                    if (htmlFromBody && htmlFromBody.trim() == '') htmlFromBody = null;

                    if (this.props && Object.prototype.hasOwnProperty.call(this.props, 'RichTextEditor') && htmlFromBody != null) {
                        body = this.props.RichTextEditor.createValueFromString(htmlFromBody, 'html');
                    }
                    body += messageHTML;
                    isHtml = false;
                }
            }

            let rtags;
            {
                const html = isHtml ? body : remarkable.render(body);
                rtags = HtmlReady(html, { mutate: false });
            }

            allowedTags.forEach((tag) => {
                rtags.htmltags.delete(tag);
            });
            if (isHtml) rtags.htmltags.delete('html'); // html tag allowed only in HTML mode
            if (rtags.htmltags.size) {
                errorCallback(
                    'Please remove the following HTML elements from your post: '
                    + Array(...rtags.htmltags)
                        .map((tag) => `<${tag}>`)
                        .join(', ')
                );
                return;
            }

            const formCategories = Set(
                category
                    ? category.trim().replace(/#/g, '').split(/ +/)
                    : []
            );
            const rootCategory = originalPost && originalPost.category
                ? originalPost.category
                : formCategories.first();
            let allCategories = Set([...formCategories.toJS()]);
            if (/^[-a-z\d]+$/.test(rootCategory)) allCategories = allCategories.add(rootCategory);

            const postHashtags = [...rtags.hashtags];
            while (allCategories.size < 10 && postHashtags.length > 0) {
                allCategories = allCategories.add(postHashtags.shift());
            }

            // merge
            const meta = isEdit ? jsonMetadata : {};
            if (allCategories.size) meta.tags = allCategories.toJS();
            else delete meta.tags;
            if (rtags.usertags.size) meta.users = Array.from(rtags.usertags);
            else delete meta.users;
            if (rtags.images.size) {
                const moveToFirst = (array, first) => {
                    array.sort((x, y) => {
                        return x === first ? -1 : y === first ? 1 : 0;
                    });
                };
                meta.image = Array.from(rtags.images);

                // If a cover image has been manually selected,
                // move it to the first element of the image array.
                if (selectedCoverImage) {
                    moveToFirst(meta.image, selectedCoverImage);
                }
            } else delete meta.image;
            if (rtags.links.size) meta.links = Array.from(rtags.links);
            else delete meta.links;

            meta.app = 'blurtlatam/0.1';
            if (isStory) {
                meta.format = isHtml ? 'html' : 'markdown';
                if (summary) {
                    meta.description = summary;
                }
            }

            // if(Object.keys(json_metadata.steem).length === 0) json_metadata = {}// keep json_metadata minimal
            const sanitizeErrors = [];
            sanitize(body, sanitizeConfig({ sanitizeErrors }));
            if (sanitizeErrors.length) {
                errorCallback(sanitizeErrors.join('.  '));
                return;
            }

            if (meta.tags.length > 10) {
                const includingCategory = isEdit
                    ? tt('reply_editor.including_the_category', {
                        rootCategory,
                    })
                    : '';
                errorCallback(
                    tt('reply_editor.use_limited_amount_of_tags', {
                        tagsLength: meta.tags.length,
                        includingCategory,
                    })
                );
                return;
            }

            startLoadingIndicator();

            const originalBody = isEdit ? originalPost.body : null;
            const __config = { originalBody };
            console.log('config', __config);
            // Avoid changing payout option during edits #735
            if (!isEdit && isStory) {
                if (!__config.comment_options) {
                    __config.comment_options = {
                        author: username,
                        permlink,
                    };
                }
                if (!__config.comment_options.extensions) {
                    __config.comment_options.extensions = [];
                }
                switch (payoutType) {
                    case '0%': // decline payout
                        __config.comment_options = {
                            max_accepted_payout: '0.000 BLURT',
                        };
                        break;
                    case '100%':
                        __config.comment_options.extensions.push([
                            1,
                            {
                                percent_blurt: 0,
                            },
                        ]);
                        break;
                    case '75%': // default
                        break;
                    default: // dd//
                }
                if (beneficiaries && beneficiaries.length > 0) {
                    if (!__config.comment_options.extensions) {
                        __config.comment_options.extensions = [];
                    }

                    const beneficiariesList = [
                        0,
                        {
                            beneficiaries: beneficiaries
                                .sort((a, b) => a.username < b.username
                                    ? -1
                                    : a.username > b.username
                                        ? 1
                                        : 0)
                                .map((elt) => ({
                                    account: elt.username,
                                    weight: parseInt(elt.percent) * 100,
                                })),
                        },
                    ];

                    __config.comment_options.extensions.splice(
                        0,
                        0,
                        beneficiariesList
                    );
                    __config.comment_options.extensions.join();
                } else {
                    if (!__config.comment_options) {
                        __config.comment_options = {};
                    }
                    const account = state.global.getIn([
                        'accounts',
                        username,
                    ]);
                    let referrer = '';
                    if (
                        account.get('json_metadata') !== undefined
                        && account.get('json_metadata') !== ''
                    ) {
                        const accountCreatedDaysAgo = (new Date().getTime()
                            - new Date(
                                `${account.get('created')}Z`
                            ).getTime())
                            / 1000
                            / 60
                            / 60
                            / 24;
                        if (accountCreatedDaysAgo < 30) {
                            referrer = JSON.parse(
                                account.get('json_metadata')
                            ).referral;
                        }
                    }
                    if (referrer) {
                        __config.comment_options.extensions.push([
                            0,
                            {
                                beneficiaries: [
                                    {
                                        account: referrer,
                                        weight: 300,
                                    },
                                ],
                            },
                        ]);
                    }
                }
            }

            const operation = {
                ...linkProps,
                category: rootCategory,
                title,
                body,
                json_metadata: meta,
                __config,
            };
            const operationFlatFee = state.global.getIn([
                'props',
                'operation_flat_fee',
            ]);
            const bandwidthKbytesFee = state.global.getIn([
                'props',
                'bandwidth_kbytes_fee',
            ]);
            const size = JSON.stringify(operation).replace(
                /[\[\]\,\"]/g,
                ''
            ).length;
            const bw_fee = Math.max(
                0.001,
                ((size / 1024) * bandwidthKbytesFee).toFixed(3)
            );
            const fee = (operationFlatFee + bw_fee).toFixed(3);

            dispatch(
                transactionActions.broadcastOperation({
                    type: 'comment',
                    confirm: tt('g.operation_cost', { fee }),
                    operation,
                    errorCallback,
                    successCallback,
                })
            );
        },
    })
)(ReplyEditor);
