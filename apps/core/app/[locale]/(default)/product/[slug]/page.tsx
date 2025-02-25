import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getProduct } from '~/client/queries/get-product';
import { revalidate } from '~/client/revalidate-target';
import { LocaleType } from '~/i18n';

import { Breadcrumbs, BreadcrumbsFragment } from './_components/breadcrumbs';
import { Description, DescriptionFragment } from './_components/description';
import { Details, DetailsFragment } from './_components/details';
import { Gallery } from './_components/gallery';
import { GalleryFragment } from './_components/gallery/fragment';
import { RelatedProducts } from './_components/related-products';
import { Reviews } from './_components/reviews';
import { Warranty, WarrantyFragment } from './_components/warranty';

interface ProductPageProps {
  params: { slug: string; locale: LocaleType };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productId = Number(params.slug);
  const product = await getProduct(productId);

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

const ProductPageQuery = graphql(
  `
    query ProductPageQuery($entityId: Int!, $optionValueIds: [OptionValueId!]) {
      site {
        product(entityId: $entityId, optionValueIds: $optionValueIds) {
          ...GalleryFragment
          ...DetailsFragment
          ...DescriptionFragment
          ...WarrantyFragment
          entityId
          categories(first: 1) {
            edges {
              node {
                ...BreadcrumbsFragment
              }
            }
          }
        }
      }
    }
  `,
  [BreadcrumbsFragment, GalleryFragment, DetailsFragment, DescriptionFragment, WarrantyFragment],
);

export default async function Product({ params, searchParams }: ProductPageProps) {
  const customerId = await getSessionCustomerId();

  const { locale } = params;

  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Product' });
  const messages = await getMessages({ locale });

  const productId = Number(params.slug);
  const { slug, ...options } = searchParams;

  const optionValueIds = Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables: { entityId: productId, optionValueIds },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return notFound();
  }

  const category = removeEdgesAndNodes(product.categories).at(0);

  return (
    <>
      {category && <Breadcrumbs category={category} />}

      <div className="mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
        <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
          <Gallery noImageText={t('noGalleryText')} product={product} />
          <Details product={product} />
          <div className="lg:col-span-2">
            <Description product={product} />
            <Warranty product={product} />
            <Suspense fallback={t('loading')}>
              <Reviews productId={product.entityId} />
            </Suspense>
          </div>
        </NextIntlClientProvider>
      </div>

      <Suspense fallback={t('loading')}>
        <RelatedProducts productId={product.entityId} />
      </Suspense>
    </>
  );
}

export const runtime = 'edge';
