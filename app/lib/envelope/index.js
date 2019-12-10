module.exports = class Envelope {
  constructor(build) {
    this.source = {
      sourceId: build.sourceId,
      sourceName: build.sourceName,
      allowsWrite: build.allowsWrite
    };
    this.consent = {
      consentTimestamp: build.consentTimestamp,
      consentStatus: build.consentStatus,
      consentedTimePeriod: build.consentedTimePeriod
    };
    this.data = {
      size: build.size,
      documentType: build.documentType,
      dataStructureLink: build.dataStructureLink,
      data: build.data
    };
  }
  static get Builder() {
    class Builder {
      constructor() {}

      withSourceId(sourceId) {
        this.sourceId = sourceId;
        return this;
      }

      withSourceName(sourceName) {
        this.sourceName = sourceName;
        return this;
      }

      withAllowsWrite(allowsWrite) {
        this.allowsWrite = allowsWrite;
        return this;
      }

      withConsentTimestamp(consentTimestamp) {
        this.consentTimestamp = consentTimestamp;
        return this;
      }

      withConsentStatus(consentStatus) {
        this.consentStatus = consentStatus;
        return this;
      }

      withConsentedTimePeriod(consentedTimePeriod) {
        this.consentedTimePeriod = consentedTimePeriod;
        return this;
      }

      withSize(size) {
        this.size = size;
        return this;
      }

      withDocumentType(documentType) {
        this.documentType = documentType;
        return this;
      }

      withDataStructureLink(dataStructureLink) {
        this.dataStructureLink = dataStructureLink;
        return this;
      }

      withData(data) {
        this.data = data;
        return this;
      }

      build() {
        return new Envelope(this);
      }
    }
    return Builder;
  }
};
